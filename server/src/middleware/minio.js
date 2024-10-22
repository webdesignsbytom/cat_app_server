import multer from 'multer';
import { Readable } from 'stream';
// Config
import {
  minioClient,
  bucketName,
  minioEndpoint,
  minioPort,
} from '../utils/minioConfig.js';

// Custom Multer storage engine for MinIO
const minioStorage = multer.memoryStorage();

// Middelware component
export const uploadToMinio = multer({
  storage: minioStorage,
}).single('video');

export const uploadImageToMinio = multer({
  storage: minioStorage,
}).single('image');


export const uploadFileToMinIO = async (fileBuffer, fileName) => {
  try {

    if (!(fileBuffer.buffer instanceof Buffer)) {
      throw new Error('fileBuffer must be a Buffer');
    }

    const fileStream = Readable.from(fileBuffer.buffer);
    await minioClient.putObject(
      bucketName,
      fileName,
      fileStream,
      fileBuffer.length,
      {
        'Content-Type': 'video/mp4', 
      }
    );

    return `http://${minioEndpoint}:${minioPort}/${bucketName}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    return null;
  }
};

export const uploadImageFileToMinIO = async (fileBuffer, folder, userId) => {
  try {
    const fileName = `${folder}${Date.now()}-${userId}-${fileBuffer.originalname}`;
    const fileStream = Readable.from(fileBuffer.buffer);

    await minioClient.putObject(
      bucketName,
      fileName,
      fileStream,
      fileBuffer.size,
      {
        'Content-Type': fileBuffer.mimetype,
      }
    );

    return `http://${minioEndpoint}:${minioPort}/${bucketName}${fileName}`;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    return null;
  }
};
