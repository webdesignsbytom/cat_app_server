import bcrypt from 'bcrypt';
import dbClient from '../src/utils/dbClient.js';

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
              image: 'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
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
              image: 'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
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
              image: 'https://github.com/webdesignsbytom/Cat-App/blob/master/src/assets/images/background/small_cat_blue_2.png?raw=true',
            },
          },
        },
      },
    },
  });

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
