import { myEmitter } from '../utils/eventEmitter.js';
import {
  createGetAllEvent,
  createRegisterEvent,
  createVerifyEvent,
  createNewVerifyEvent,
  createPasswordResetEvent,
  createDeleteUserEvent,
  createUpdateUserEvent,
  createDeactivateUserEvent,
  createReactivateUserEvent
} from './utils/userUtils.js';

export const myEmitterUsers = myEmitter;

// Event listeners for user events
myEmitterUsers.on('get-all-users', async (user) => createGetAllEvent(user));
myEmitterUsers.on('register', async (user) => createRegisterEvent(user));
myEmitterUsers.on('verified', async (user) => createVerifyEvent(user));
myEmitterUsers.on('resend-verification', async (user) => createNewVerifyEvent(user));
myEmitterUsers.on('password-reset', async (user) => createPasswordResetEvent(user));
myEmitterUsers.on('update-user', async (user) => createUpdateUserEvent(user));
myEmitterUsers.on('change-role', async (user) => createChangeUserRoleEvent(user));
myEmitterUsers.on('deactivate-user', async (user) => createDeactivateUserEvent(user));
myEmitterUsers.on('reactivate-user', async (user) => createReactivateUserEvent(user));
myEmitterUsers.on('deleted-user', async (user) => createDeleteUserEvent(user));
