import dbClient from '../utils/dbClient.js';

export const getUserGameData = (gameId) =>
  dbClient.game.findUnique({
    where: { id: gameId },
  });
