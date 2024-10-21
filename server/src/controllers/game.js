// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
import { myEmitterEvents } from '../event/eventEvents.js';
// Domain
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import { NotFoundEvent, ServerErrorEvent } from '../event/utils/errorUtils.js';
import { getUserGameData } from '../domain/game.js';

export const getUserGameDataHandler = async (req, res) => {
  console.log('getUserGameDataHandler');
  const { gameId } = req.params;
  
  try {
    const foundData = await getUserGameData(gameId);
    console.log('found data:', foundData);

    if (!foundData) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.gameNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { game: foundData });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get user game data failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const startNewGameHandler = async (req, res) => {
  console.log('startNewGameHandler');

  try {
    const foundData = await getUserGameData();
    console.log('found data:', foundData);

    if (!foundData) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.eventTag
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { game: foundData });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get user game data failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
