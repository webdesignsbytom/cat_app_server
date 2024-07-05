import { myEmitter } from '../utils/eventEmitter.js';

export const myEmitterAdmin = myEmitter;

// Event listeners for user events
myEmitterAdmin.on('get-all-admin', async (user) => createGetAllEvent(user));

