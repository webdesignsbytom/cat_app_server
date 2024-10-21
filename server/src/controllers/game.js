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
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { getUserGameData, resetGameForNewGame } from '../domain/game.js';
import { StartingGameData } from '../utils/constants.js';

export const getUserGameDataHandler = async (req, res) => {
  console.log('getUserGameDataHandler');
  const { gameId } = req.params;

  if (!gameId) {
    return sendDataResponse(res, 400, {
      message: 'Missing gameId.',
    });
  }

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

export const resetForNewGameHandler = async (req, res) => {
  console.log('resetForNewGameHandler');
  const { gameId } = req.params;

  if (!gameId) {
    return sendDataResponse(res, 400, {
      message: 'Missing gameId.',
    });
  }
  try {
    const foundData = await getUserGameData(gameId);
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

    const resetGameData = await resetGameForNewGame(gameId, StartingGameData);
    console.log('resetGameData', resetGameData);

    if (!resetGameData) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.resetGameFailed
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, { game: resetGameData });
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
