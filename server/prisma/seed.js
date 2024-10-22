import bcrypt from 'bcrypt';
import dbClient from '../src/utils/dbClient.js';

const bucketUrl = 'localhost:9000';

async function seed() {
  const password = await bcrypt.hash('123', 8);

  const testUser = await dbClient.user.create({
    data: {
      email: `xto@gmail.com`,
      password,
      agreedToPrivacy: true,
      agreedToTerms: true,
      profile: {
        create: {
          firstName: 'Henny',
          lastName: 'Jerry',
          country: 'England',
          cats: {
            create: {
              name: 'Whiskers',
              dob: new Date(2020, 1, 1),
              breed: 'Siamese',
              favouriteFood: 'Salmon',
              nickname: `Wik`,
              imageUrl:
                'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
            },
          },
        },
      },
    },
  });

  const adminUser = await dbClient.user.create({
    data: {
      email: 'admin@admin.com',
      password,
      role: 'ADMIN',
      agreedToPrivacy: true,
      agreedToTerms: true,
      profile: {
        create: {
          firstName: 'Henny',
          lastName: 'Jerry',
          country: 'England',
          cats: {
            create: {
              name: 'Mittens',
              dob: new Date(2019, 5, 10),
              breed: 'Persian',
              favouriteFood: 'Chicken',
              nickname: `Wik`,
              imageUrl:
                'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
            },
          },
        },
      },
    },
  });

  const devUser = await dbClient.user.create({
    data: {
      email: 'dev@dev.com',
      password,
      role: 'DEVELOPER',
      agreedToPrivacy: true,
      agreedToTerms: true,
      profile: {
        create: {
          firstName: 'Henny',
          lastName: 'Jerry',
          country: 'England',
          cats: {
            create: {
              name: 'Shadow',
              dob: new Date(2018, 10, 20),
              breed: 'Maine Coon',
              favouriteFood: 'Tuna',
              nickname: `Wik`,
              imageUrl:
                'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
            },
          },
        },
      },
    },
  });

  const videos = [
    {
      label: 'Cat Video 1',
      name: 'cat_video_1',
      videoStatus: 'APPROVED',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video1.mp4`,
      size: 150000000,
      duration: 120.5,
      codec: 'H.264',
      width: 1280,
      height: 720,
    },
    {
      label: 'Cat Video 2',
      name: 'cat_video_2',
      videoStatus: 'APPROVED',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video2.mp4`,
      size: 200000000,
      duration: 150.0,
      codec: 'H.265',
      width: 1920,
      height: 1080,
    },
    {
      label: 'Cat Video 3',
      name: 'cat_video_3',
      videoStatus: 'APPROVED',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video3.mp4`,
      size: 300000000,
      duration: 180.0,
      codec: 'H.264',
      width: 1280,
      height: 720,
    },
    {
      label: 'Cat Video 4',
      name: 'cat_video_4',
      videoStatus: 'APPROVED',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video4.mp4`,
      size: 250000000,
      duration: 200.0,
      codec: 'H.264',
      width: 1280,
      height: 720,
    },
    {
      label: 'Cat Video 5',
      name: 'cat_video_5',
      videoStatus: 'PENDING',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video5.mp4`,
      size: 180000000,
      duration: 160.0,
      codec: 'H.265',
      width: 1920,
      height: 1080,
    },
    {
      label: 'Cat Video 6',
      name: 'cat_video_6',
      videoStatus: 'PENDING',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video6.mp4`,
      size: 250000000,
      duration: 200.0,
      codec: 'H.264',
      width: 1280,
      height: 720,
    },
    {
      label: 'Cat Video 7',
      name: 'cat_video_7',
      videoStatus: 'PENDING',
      path: `http://${bucketUrl}/catapp/videos/review/cat_video7.mp4`,
      size: 180000000,
      duration: 160.0,
      codec: 'H.265',
      width: 1920,
      height: 1080,
    },
    {
      label: 'Cat Video 8',
      name: 'cat_video_8',
      videoStatus: 'DELETED',
      path: `http://${bucketUrl}/catapp/videos/deleted/cat_video8.mp4`,
      size: 180000000,
      duration: 160.0,
      codec: 'H.265',
      width: 1920,
      height: 1080,
    },
    {
      label: 'Cat Video 9',
      name: 'cat_video_9',
      videoStatus: 'DELETED',
      path: `http://${bucketUrl}/catapp/videos/deleted/cat_video9.mp4`,
      size: 180000000,
      duration: 160.0,
      codec: 'H.265',
      width: 1920,
      height: 1080,
    },
  ];

  const videoRecords = [];
  for (const video of videos) {
    const createdVideo = await dbClient.video.create({
      data: video,
    });
    videoRecords.push(createdVideo);
  }

  // Create Playlists
  const playlists = [
    { name: 'COTD', bucket: 'cotd' },
    { name: 'Therapy', bucket: 'therapy' },
    { name: 'Endless', bucket: 'endless' },
  ];

  // Insert playlists and associate videos with each
  for (const playlist of playlists) {
    await dbClient.playlist.create({
      data: {
        name: playlist.name,
        videos: {
          connect: videoRecords.map((video) => ({
            id: video.id, // Connect the existing videos by their IDs
          })),
        },
      },
    });
  }

  // EVENTS
  const eventOne = await dbClient.event.create({
    data: {
      type: 'ERROR',
      topic: 'Test event',
      code: 500,
      content: '500 test content',
    },
  });
  const eventTwo = await dbClient.event.create({
    data: {
      type: 'USER',
      topic: 'Test event',
      code: 200,
      content: '200 test content',
    },
  });
  const eventThree = await dbClient.event.create({
    data: {
      type: 'ADMIN',
      topic: 'Test event',
      code: 201,
      content: '201 test content',
    },
  });
  const eventFour = await dbClient.event.create({
    data: {
      type: 'VISITOR',
      topic: 'Test event',
      code: 201,
      content: '201 test content',
    },
  });
  const eventFive = await dbClient.event.create({
    data: {
      type: 'DEVELOPER',
      topic: 'Test event',
      code: 201,
      content: '201 test content',
    },
  });
}

seed().catch(async (error) => {
  console.error(error);
  await dbClient.$disconnect();
  process.exit(1);
});
