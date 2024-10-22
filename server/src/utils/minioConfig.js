import { Client } from 'minio';

// Name of the bucket to store uploads
export const bucketName = process.env.MINIO_BUCKET_NAME;
export const minioPort = parseInt(process.env.MINIO_PORT);
export const minioEndpoint = process.env.MINIO_BUCKET_ENDPOINT;

// Create MinIO client
export const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Ensure that the bucket exists in MinIO
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    return console.log('Error checking bucket:', err);
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) {
        return console.log('Error creating bucket:', err);
      }
      console.log(`Bucket '${bucketName}' created successfully.`);
    });
  }
});

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
