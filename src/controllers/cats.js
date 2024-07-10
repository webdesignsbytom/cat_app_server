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

export const addNewCatToUser = async (req, res) => {
  console.log('addNewCatToUser');
  const { userEmail, name, dob, breed, favouriteFood, image } = req.body;

  if (!name || !dob || !breed || !favouriteFood || !image || !userEmail) {
    const missingFields = new MissingFieldEvent(
      req.user,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', missingFields);
    return sendMessageResponse(res, missingFields.code, missingFields.message);
  }

  try {
    const lowerCaseEmail = userEmail.toLowerCase();
    const foundUser = await findUserByEmail(lowerCaseEmail);

    if (!foundUser) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const newCat = await createCatForUser(
      foundUser.id,
      name,
      new Date(dob),
      breed,
      favouriteFood,
      image
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

export const getAllUserCatProfiles = async (req, res) => {
  console.log('getAllUserCatProfiles');
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

export const updateCatData = async (req, res) => {
  console.log('updateCatData');
  const { userId, catId } = req.params;
  const { name, dob, breed, favouriteFood, image } = req.body;

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

    const updatedCatData = {
      name: name ?? foundCat.name,
      dob: dob ? new Date(dob) : foundCat.dob,
      breed: breed ?? foundCat.breed,
      favouriteFood: favouriteFood ?? foundCat.favouriteFood,
      image: image ?? foundCat.image,
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

export const deleteCatFromUserProfile = async (req, res) => {
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
