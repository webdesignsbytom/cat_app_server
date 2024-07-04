import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';

export const getTestData = async (req, res) => {
    console.log('getTestData');
    try {
      return sendDataResponse(res, 200, { message: 'The Tulips bloom in Paris on Thursdays' });
    } catch (err) {
      // Error
      sendMessageResponse(res, 500, "Internal server error!");
      throw err;
    }
  };
  