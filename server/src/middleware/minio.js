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
    const fileName = `${folder}${Date.now()}-${userId}-${
      fileBuffer.originalname
    }`;
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

export const moveVideoToApprovedBucket = async (
  sourceBucket,
  destinationBucket,
  objectName
) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>');
  console.log('sourceBucket', sourceBucket);
  console.log('destinationBucket', destinationBucket);
  console.log('objectName', objectName);

  try {
    // MinIO host configuration
    const minioHost = 'localhost'; // Replace with your MinIO server IP
    const minioPort = '9000';
    const bucketName = 'catapp'; // Correct bucket name is 'catapp'

    // Adjust the object name to match the actual structure
    const copySource = `/${bucketName}/videos/${objectName}`; // Correct source path with leading '/'
    const newObjectName = objectName.replace('review/', 'approved/'); // New destination path inside the bucket // approved/cat_video6.mp4

    console.log('copySource', copySource);
    console.log('New object name:', newObjectName);

    // Perform the copy operation in the same bucket with new object name (approved path)
    await minioClient.copyObject(
      bucketName, // catapp
      `videos/${newObjectName}`, // approved/cat_video6.mp4
      copySource // /catapp/videos/review/cat_video6.mp4
    );
    console.log('<<<<<<<<<<<<<<<<<<<<');

    // Remove the original object from the "review" folder
    await minioClient.removeObject(bucketName, `videos/${objectName}`); // review/cat_video6.mp4

    // Construct the new full URL of the video
    const newUrl = `http://${minioHost}:${minioPort}/${bucketName}/videos/${newObjectName}`;

    console.log(`Video moved from ${objectName} to ${newObjectName}`);
    console.log(`New video URL: ${newUrl}`);

    // Return the new URL of the video
    return newUrl;
  } catch (err) {
    console.error('Error moving video:', err);
    throw err;
  }
};

export const moveVideoToDeletedBucket = async (objectName) => {
  try {
    console.log('TTTTTTTTTTTTTTTTTTTT', bucketName, `${objectName}`);

    const fileName = objectName.split('/').pop(); // e.g., 'cat_video5.mp4'
    console.log('FILENAME AAA', fileName);
    const copySource = `/${bucketName}/${objectName}`; // Correct source path with leading '/'

    await minioClient.copyObject(
      bucketName, // catapp
      `videos/deleted/${fileName}`, // videos/deleted/cat_video6.mp4
      copySource // /catapp/videos/review/cat_video6.mp4
    );

    await minioClient.removeObject(bucketName, `${objectName}`); // review/cat_video6.mp4
    const newUrl = `http://${minioEndpoint}:${minioPort}/${bucketName}/videos/deleted/${fileName}`;

    return newUrl;
  } catch (err) {
    console.error('Error deleting video:', err);
    throw err;
  }
};

export const removeVideoFromBucket = async (objectName) => {
  try {
    console.log('>>>>', bucketName, `${objectName}`);
    await minioClient.removeObject(bucketName, `${objectName}`); // review/cat_video6.mp4
  } catch (err) {
    console.error('Error deleting video:', err);
    throw err;
  }
};
