import { myEmitter } from '../utils/eventEmitter.js';
// Events
import { createAdminTestEvent } from './utils/adminUtils.js';

export const myEmitterAdmin = myEmitter;

// Event listeners for user events
myEmitterAdmin.on('get-all-admin', async (user) => createAdminTestEvent(user));

