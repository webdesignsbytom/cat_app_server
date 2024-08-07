import dbClient from '../utils/dbClient.js';

export const findAllUsers = () =>
  dbClient.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findUserByEmail = (email) =>
  dbClient.user.findUnique({
    where: { email: email },
    include: {
      profile: {
        include: {
          cats: true,
        },
      },
    },
  });

export const findUsersByRole = (role) =>
  dbClient.user.findMany({
    where: {
      role: role,
    },
  });

export const createUser = (
  lowerCaseEmail,
  hashedPassword,
  lowerCaseFirstName,
  lowerCaseLastName,
  lowerCaseCountry,
  agreedToTerms,
  agreedToPrivacy
) =>
  dbClient.user.create({
    data: {
      email: lowerCaseEmail,
      password: hashedPassword,
      profile: {
        create: {
          firstName: lowerCaseFirstName,
          lastName: lowerCaseLastName,
          country: lowerCaseCountry,
        },
      },
      agreedToTerms: agreedToTerms,
      agreedToPrivacy: agreedToPrivacy,
    },
  });

export const findVerification = (userId) =>
  dbClient.userVerification.findUnique({
    where: {
      userId: userId,
    },
  });

export const findResetRequest = (userId) =>
  dbClient.passwordReset.findUnique({
    where: {
      userId: userId,
    },
  });

export const findUserById = (userId) =>
  dbClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: {
        include: {
          cats: true,
        },
      },
    },
  });

export const resetUserPassword = (userId, password) =>
  dbClient.user.update({
    where: {
      id: userId,
    },
    data: {
      password: password,
    },
  });

export const deleteUserById = (userId) =>
  dbClient.user.delete({
    where: {
      id: userId,
    },
  });

export const updateUserById = (userId, email, firstName, lastName, country) =>
  dbClient.user.update({
    where: {
      id: userId,
    },
    data: {
      email,
      firstName,
      lastName,
      country,
    },
  });
