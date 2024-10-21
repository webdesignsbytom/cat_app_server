import dbClient from '../utils/dbClient.js';

export const getUserGameData = (gameId) =>
  dbClient.game.findUnique({
    where: { id: gameId },
  });

export const resetGameForNewGame = (gameId, data) =>
  dbClient.game.update({
    where: { id: gameId },
    data,
  });
