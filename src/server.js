import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import * as url from 'url';
import { join } from 'path';
// Routes
import videoRouter from './routes/videos.js';
import adminRouter from './routes/admin.js';

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
app.use('/videos', videoRouter);
app.use('/admin', adminRouter);

// Server interface page
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: join(__dirname, 'views'),
  });
});

app.get('/test', (req, res) => {
  return res.status(200).json({
      message: 'look out radioactive man'
  });
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

app.listen(PORT, () => {
  console.log(`\nServer is running on http://localhost:${PORT} \nThis no longer consumes souls.`);
});
