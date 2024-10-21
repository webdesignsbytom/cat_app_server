import dbClient from '../utils/dbClient.js';

export const createCatForUser = async (
  userId,
  name,
  dob,
  breed,
  favouriteFood,
  image
) => {
  return await dbClient.cat.create({
    data: {
      name,
      dob,
      breed,
      favouriteFood,
      image,
      profile: {
        connect: {
          userId,
        },
      },
    },
  });
};

export const getAllCatsByProfileId = async (profileId) => {
  return await dbClient.cat.findMany({
    where: { profileId },
  });
};

export const findCatById = async (id) => {
  return await dbClient.cat.findUnique({
    where: { id },
  });
};

export const updateCatById = async (id, data) => {
  return await dbClient.cat.update({
    where: { id },
    data,
  });
};

export const deleteCatById = async (id) => {
  return await dbClient.cat.delete({
    where: { id },
  });
};
