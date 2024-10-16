import bcrypt from 'bcrypt';
import dbClient from '../utils/dbClient.js';
// Components
import { createVerificationInDB, createPasswordResetInDB } from './utils.js';
// Emitters
import { myEmitterUsers } from '../event/userEvents.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  findAllUsers,
  findUserByEmail,
  createUser,
  findVerification,
  findResetRequest,
  findUserById,
  resetUserPassword,
  deleteUserById,
  updateUserById,
} from '../domain/users.js';
import { createAccessToken } from '../utils/tokens.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  NotFoundEvent,
  ServerErrorEvent,
  MissingFieldEvent,
  RegistrationServerErrorEvent,
  ServerConflictError,
  BadRequestEvent,
} from '../event/utils/errorUtils.js';
// Time
import { v4 as uuid } from 'uuid';
// Email
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../utils/sendEmail.js';
// Logging
import { logger } from '../log/utils/loggerUtil.js';

// Password hash
const hashRate = 8;

export const getAllUsers = async (req, res) => {
  console.log('getAllUsers');

  try {
    const foundUsers = await findAllUsers();
    if (!foundUsers) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterUsers.emit('get-all-users', req.user);
    return sendDataResponse(res, 200, { users: foundUsers });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Get all users`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getUserById = async (req, res) => {
  console.log('getUserById');
  const { userId } = req.params;
  logger.info(`\nGet user by id called by ${userId}`);

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
    delete foundUser.password;
    delete foundUser.agreedToTerms;

    myEmitterUsers.emit('get-user-by-id', req.user);
    return sendDataResponse(res, 200, { user: foundUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Get user by ID`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const registerNewUser = async (req, res) => {
  console.log('create new user');
  const {
    email,
    password,
    firstName,
    lastName,
    country,
    agreedToTerms,
    agreedToPrivacy,
  } = req.body;
  console.log('email');

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !country ||
    !agreedToTerms ||
    !agreedToPrivacy
  ) {
    const missingFields = new MissingFieldEvent(
      req.user,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', missingFields);
    return sendMessageResponse(res, missingFields.code, missingFields.message);
  }

  // Lowercase for search integrity
  const lowerCaseEmail = email.toLowerCase();
  const lowerCaseFirstName = firstName.toLowerCase();
  const lowerCaseLastName = lastName.toLowerCase();
  const lowerCaseCountry = country.toLowerCase();

  try {
    const foundUser = await findUserByEmail(lowerCaseEmail);
    if (foundUser) {
      return sendDataResponse(res, 400, { email: EVENT_MESSAGES.emailInUse });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, hashRate);

    // Create new user
    const newUser = await createUser(
      lowerCaseEmail,
      hashedPassword,
      lowerCaseFirstName,
      lowerCaseLastName,
      lowerCaseCountry,
      agreedToTerms,
      agreedToPrivacy
    );

    // Create unique verification string
    const uniqueString = uuid() + newUser.id;
    const hashedString = await bcrypt.hash(uniqueString, hashRate);

    // Create verification model
    await createVerificationInDB(newUser.id, hashedString);

    // Send verification email
    // await sendVerificationEmail(newUser.id, newUser.email, uniqueString);

    myEmitterUsers.emit('register', newUser);
    return sendDataResponse(res, 201, { user: newUser });
  } catch (err) {
    //
    const serverError = new RegistrationServerErrorEvent(
      `Register New User Server error`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const verifyUserEmail = async (req, res) => {
  console.log('Verifying user');
  const { userId, uniqueString } = req.params;

  try {
    const foundVerification = await findVerification(userId);

    if (!foundVerification) {
      const missingVerification = new NotFoundEvent(
        userId,
        EVENT_MESSAGES.verificationNotFound
      );
      myEmitterErrors.emit('error', missingVerification);
      return sendMessageResponse(
        res,
        404,
        EVENT_MESSAGES.verificationNotFoundReturnMessage
      );
    }

    const { expiresAt } = foundVerification;
    if (expiresAt < Date.now()) {
      await dbClient.userVerification.delete({ where: { userId } });
      await dbClient.user.delete({ where: { userId } });
      return sendMessageResponse(res, 401, EVENT_MESSAGES.expiredLinkMessage);
    }

    const isValidString = await bcrypt.compare(
      uniqueString,
      foundVerification.uniqueString
    );

    if (!isValidString) {
      return sendMessageResponse(
        res,
        401,
        EVENT_MESSAGES.invalidVerificationMessage
      );
    }

    const updatedUser = await dbClient.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    delete updatedUser.password;

    const token = createAccessToken(updatedUser.id, updatedUser.email);

    await dbClient.userVerification.delete({ where: { userId } });

    myEmitterUsers.emit('verified', updatedUser);
    sendDataResponse(res, 200, { token, user: updatedUser });
  } catch (err) {
    const serverError = new RegistrationServerErrorEvent(
      `Verify New User Server error`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const resendVerificationEmail = async (req, res) => {
  console.log('resendVerificationEmail');
  const { email } = req.params;

  if (!email) {
    const badRequest = new BadRequestEvent(
      null,
      EVENT_MESSAGES.missingUserIdentifier
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundUser = await dbClient.user.findUnique({ where: { email } });
    if (!foundUser) {
      const notFound = new NotFoundEvent('user', EVENT_MESSAGES.emailNotFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const foundVerification = await dbClient.userVerification.findUnique({
      where: { userId: foundUser.id },
    });

    if (!foundVerification) {
      const serverError = new ServerConflictError(
        email,
        EVENT_MESSAGES.verificationNotFoundReturnMessage
      );

      myEmitterErrors.emit('verification-not-found', serverError);
      return sendMessageResponse(res, serverError.code, serverError.message);
    }

    await dbClient.userVerification.delete({ where: { userId: foundUser.id } });

    const uniqueString = uuid() + foundUser.id;
    const hashedString = await bcrypt.hash(uniqueString, hashRate);
    await createVerificationInDB(foundUser.id, hashedString);

    await sendVerificationEmail(foundUser.id, foundUser.email, uniqueString);

    myEmitterUsers.emit('resend-verification', foundUser);
    return sendMessageResponse(res, 201, 'Verification email resent');
    //
  } catch (err) {
    const serverError = new RegistrationServerErrorEvent(
      `Verify New User Server error`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const sendPasswordReset = async (req, res) => {
  const { resetEmail } = req.body;

  if (!resetEmail) {
    const badRequest = new BadRequestEvent(
      null,
      'Reset Password - Missing email'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  const lowerCaseEmail = resetEmail.toLowerCase();

  try {
    const foundUser = await findUserByEmail(lowerCaseEmail);

    if (!foundUser) {
      return sendDataResponse(res, 404, {
        email: EVENT_MESSAGES.emailNotFound,
      });
    }

    // Create unique string for verify URL
    const uniqueString = uuid() + foundUser.id;
    const hashedString = await bcrypt.hash(uniqueString, hashRate);

    await createPasswordResetInDB(foundUser.id, hashedString);
    await sendResetPasswordEmail(foundUser.id, foundUser.email, uniqueString);

    myEmitterUsers.emit('password-reset', foundUser);
    return sendMessageResponse(res, 200, 'Password reset email sent');
    //
  } catch (err) {
    const serverError = new ServerErrorEvent(
      `Request password reset Server error`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const resetPassword = async (req, res) => {
  const { userId, uniqueString } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    const badRequest = new BadRequestEvent(
      userId,
      EVENT_MESSAGES.passwordMatchError
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundResetRequest = await findResetRequest(userId);

    if (!foundResetRequest) {
      const missingRequest = new NotFoundEvent(
        userId,
        EVENT_MESSAGES.verificationNotFound
      );
      myEmitterErrors.emit('error', missingRequest);
      return sendMessageResponse(res, 404, EVENT_MESSAGES.passwordResetError);
    }

    const { expiresAt } = foundResetRequest;
    if (expiresAt < Date.now()) {
      await dbClient.passwordReset.delete({ where: { userId } });
      return sendMessageResponse(res, 401, EVENT_MESSAGES.expiredLinkMessage);
    }

    const isValidString = await bcrypt.compare(
      uniqueString,
      foundResetRequest.uniqueString
    );

    if (!isValidString) {
      return sendMessageResponse(
        res,
        401,
        EVENT_MESSAGES.invalidVerificationMessage
      );
    }

    const foundUser = await findUserById(userId);
    const hashedPassword = await bcrypt.hash(password, hashRate);
    const updatedUser = await resetUserPassword(foundUser.id, hashedPassword);

    delete updatedUser.password;

    await dbClient.passwordReset.delete({ where: { userId } });

    myEmitterUsers.emit('password-reset', updatedUser);
    sendDataResponse(res, 200, { user: updatedUser });
    //
  } catch (err) {
    const serverError = new ServerErrorEvent(`Reset password server error`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const updateUser = async (req, res) => {
  console.log('update user');
  const { userId } = req.params;
  const { email, firstName, lastName, country } = req.body;

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

    const updatedUser = await updateUserById(
      userId,
      email,
      firstName,
      lastName,
      country
    );

    delete updatedUser.password;
    delete updatedUser.agreedToTerms;

    myEmitterUsers.emit('update-user', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(`Update user server error`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const changeUserRole = async (req, res) => {
  const userId = req.params.userId;
  const { newRole } = req.body;

  if (!newRole) {
    const missingFields = new MissingFieldEvent(
      req.user,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', missingFields);
    return sendMessageResponse(res, missingFields.code, missingFields.message);
  }

  try {
    const updatedUser = await updateUserById(userId, { role: newRole });

    myEmitterUsers.emit('change-role', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Change user role');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deactivateUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const updatedUser = await updateUserById(userId, { isActive: false });

    myEmitterUsers.emit('deactivate-user', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Deactivate user');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const reactivateUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const updatedUser = await updateUserById(userId, { isActive: true });

    myEmitterUsers.emit('reactivate-user', req.user);
    return sendDataResponse(res, 200, { user: updatedUser });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Reactivate user');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const deleteUser = async (req, res) => {
  console.log('deleteUser');
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

    await deleteUserById(userId);
    myEmitterUsers.emit('deleted-user', req.user);
    return sendDataResponse(res, 200, {
      user: foundUser,
      message: `User ${foundUser.email} deleted`,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, `Delete user`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
