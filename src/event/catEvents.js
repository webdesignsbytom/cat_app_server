import { myEmitter } from '../utils/eventEmitter.js';

export const myEmitterCats = myEmitter;

// Event listeners for user events
myEmitterCats.on('create-new-cat', async (user) => createAddNewCatEvent(user));

