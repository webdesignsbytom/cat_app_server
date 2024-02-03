import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbClient from '../utils/dbClient.js';
// File paths
import fs from 'fs'; // Make sure fs is imported
import { join, dirname } from 'path'; // Import join and dirname
import { fileURLToPath } from 'url'; // Import fileURLToPath for __dirname
// Components
// Emitters
import { myEmitterUsers } from '../event/userEvents.js';
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  NotFoundEvent,
  ServerErrorEvent,
  MissingFieldEvent,
  RegistrationServerErrorEvent,
  ServerConflictError,
  BadRequestEvent,
} from '../event/utils/errorUtils.js';
// Dir
const __dirname = dirname(fileURLToPath(import.meta.url));

export const getImages = async (req, res) => {
}
