import dbClient from '../../utils/dbClient.js';
import { myEmitterErrors } from '../errorEvents.js';
import { CreateEventError } from './errorUtils.js';

const createEvent = async (user, type, topic, content, code) => {
  try {
    await dbClient.event.create({
      data: {
        type,
        topic,
        content,
        createdById: user.id,
        code,
      },
    });
  } catch (err) {
    const error = new CreateEventError(user.id, topic);
    myEmitterErrors.emit('error', error);
    throw err;
  }
};

// Exported event creation functions
export const createGetAllEvent = async (user) => {
  await createEvent(user, 'ADMIN', 'Get all users', `Success getting all users for ${user.email}`, 200);
};

export const createRegisterEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Register', `Register successful for ${user.email} as a ${user.role}`, 201);
};

export const createVerifyEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Verify User', `Verification successful for ${user.email} as a ${user.role}`, 201);
};

export const createNewVerifyEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Verification email resend creation', `Resend verification successful for ${user.email}`, 201);
};

export const createPasswordResetEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Password Reset', `Reset password successful for ${user.email}`, 200);
};

export const createUpdateUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Updated User', `Updated user account successful for ${user.email}`, 200);
};

export const createChangeUserRoleEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Change User Role', `Changed user role for ${user.email}`, 200);
};

export const createDeactivateUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Deactivate User', `Deactivated user account for ${user.email}`, 200);
};

export const createReactivateUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Reactivate User', `Reactivated user account for ${user.email}`, 200);
};

export const createDeleteUserEvent = async (user) => {
  const type = user.role || 'USER';
  await createEvent(user, type, 'Deleted User', `Account deleted successfully for ${user.email}`, 204);
};
