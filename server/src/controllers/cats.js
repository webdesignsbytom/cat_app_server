// Database
import { findUserByEmail, findUserById } from '../domain/users.js';
import {
  createCatForUser,
  deleteCatById,
  findCatById,
  getAllCatsByProfileId,
  updateCatById,
} from '../domain/cats.js';
// Responses
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
// Events
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  BadRequestEvent,
  MissingFieldEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { uploadImageFileToMinIO } from '../middleware/minio.js';
import { compressImageHelper } from '../utils/compressorHelper.js';

export const addNewCatToUserHandler = async (req, res) => {
  console.log('addNewCatToUser');
  const { name, dob, breed, favouriteFood, image, nickname } = req.body;
  const { userId } = req.params;
  console.log('name', name);

  const { file } = req;
  console.log('file', file);

  if (!name || !dob || !breed || !favouriteFood || !userId) {
    const missingFields = new MissingFieldEvent(
      req.user,
      EVENT_MESSAGES.missingFields
    );
    return sendMessageResponse(res, missingFields.code, missingFields.message);
  }

  try {
    const foundUser = await findUserById(userId);
    console.log('foundUser', foundUser);

    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    let imageUploadResult = '';

    if (file) {
      const compressedImageBuffer = await compressImageHelper(file.buffer);
      file.buffer = compressedImageBuffer;

      imageUploadResult = await uploadImageFileToMinIO(
        file,
        `/images/users/cat-profiles/`,
        userId
      );
      console.log('imageUploadResult', imageUploadResult);
    }

    const newCat = await createCatForUser(
      foundUser.id,
      name,
      nickname,
      new Date(dob),
      breed,
      favouriteFood,
      imageUploadResult
    );

    console.log('newCat', newCat);

    return sendDataResponse(res, 200, { newCat: newCat });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Add new cat failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getUserCatsHandler = async (req, res) => {
  console.log('getUserCatsHandler');
  const { userId } = req.params;

  try {
    const foundUser = await findUserById(userId);

    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const userCats = await getAllCatsByProfileId(foundUser.profile.id);
    console.log('successful');

    return sendDataResponse(res, 200, { cats: userCats });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Get all user's cats`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const updateCatDataHandler = async (req, res) => {
  console.log('updateCatData');
  const { userId, catId } = req.params;
  const { name, dob, breed, favouriteFood, nickname } = req.body;

  const { file } = req;
  console.log('file', file);

  try {
    const foundUser = await findUserById(userId);

    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundCat = await findCatById(catId);

    if (!foundCat || foundCat.profileId !== foundUser.profile.id) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.catNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    let imageUploadResult = '';

    if (file) {
      const compressedImageBuffer = await compressImageHelper(file.buffer);
      file.buffer = compressedImageBuffer;

      imageUploadResult = await uploadImageFileToMinIO(
        file,
        `/images/users/cat-profiles/`,
        userId
      );
      console.log('imageUploadResult', imageUploadResult);
    }

    const updatedCatData = {
      name: name ?? foundCat.name,
      nickname: nickname ?? foundCat.nickname,
      dob: dob ? new Date(dob) : foundCat.dob,
      breed: breed ?? foundCat.breed,
      favouriteFood: favouriteFood ?? foundCat.favouriteFood,
      imageUrl: imageUploadResult ?? foundCat.imageUrl,
    };

    const updatedCat = await updateCatById(catId, updatedCatData);
    console.log('successful', updatedCat);

    return sendDataResponse(res, 200, { cat: updatedCat });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Update cat data`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteCatFromUserProfileHandler = async (req, res) => {
  console.log('deleteCatFromUserProfile');
  const { userId, catId } = req.params;

  try {
    const foundUser = await findUserById(userId);

    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundCat = await findCatById(catId);

    if (!foundCat || foundCat.profileId !== foundUser.profile.id) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.catNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    let deletedCat = await deleteCatById(catId);
    if (!deletedCat) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.deleteCatFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }
    console.log('success');
    return sendDataResponse(res, 200, { message: 'Cat deleted successfully' });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete cat from user profile`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
