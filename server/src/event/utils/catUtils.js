import { createEvent } from './events.js';

export const createAddNewCatEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Add cat', `Creation successful for ${user.email} and new cat profile`, 201);
};


