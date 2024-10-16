import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import * as url from 'url';
import { join } from 'path';

// Routes
import authRouter from './routes/auth.js';
import videoRouter from './routes/videos.js';
import adminRouter from './routes/admin.js';
import eventRouter from './routes/events.js';
import userRouter from './routes/users.js';
import uploadRouter from './routes/uploads.js';
import catRouter from './routes/cats.js';

const app = express();
app.disable('x-powered-by');

// Add middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use('/', authRouter);
app.use('/videos', videoRouter);
app.use('/admin', adminRouter);
app.use('/events', eventRouter);
app.use('/user', userRouter);
app.use('/uploads', uploadRouter);
app.use('/cats', catRouter);

// Server interface page
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: join(__dirname, 'views'),
  });
});

app.get('/test', (req, res) => {
  res.status(200).send('Congratulations Mr Bond you found my server lair.')
});

// For all unknown requests 404 page returns
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use((error, req, res, next) => {
  console.error(error)

  if (error.code === 'P2025') {
    return sendDataResponse(res, 404, 'Record does not exist')
  }

  return sendDataResponse(res, 500)
})

app.listen(PORT, () => {
  console.log(`\nServer is running on localhost:${PORT} \nThis no longer consumes souls.`);
});
