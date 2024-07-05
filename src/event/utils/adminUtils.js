import { createEvent } from './events';

export const createAdminTestEvent = async (user) => {
    await createEvent(user, 'ADMIN', 'Admin test', `Success getting all users for ${user.email}`, 200);
  };
  