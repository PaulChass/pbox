const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folder');
const filesRoutes = require('./routes/files');
const videoRoutes = require('./routes/video');
const syncRoutes = require('./routes/sync');
/**
 * The routes for shareable links.
 *
 * @type {Object}
 * @module shareableLinkRoutes
 */
const shareableLinkRoutes = require('./routes/shareableLink');


const User = require('./models/User'); // Assuming User model is defined
const app = express();

// Middleware setup
require('dotenv').config();

// Resumable chunked uploads (tus). Mounted before cors()/body parsers: tus
// answers its own CORS preflights (Upload-Offset, Location, ... headers).
const path = require('path');
const File = require('./models/File');
const { createTusServer, scheduleCleanup, TUS_PATH } = require('./tus/tusServer');
const { server: tusServer } = createTusServer({
  uploadsDir: path.join(__dirname, 'uploads'),
  FileModel: File,
  maxSize: Number(process.env.UPLOAD_MAX_SIZE) || undefined,
});
scheduleCleanup(tusServer);
const handleTus = (req, res) => tusServer.handle(req, res);
app.all(TUS_PATH, handleTus);
app.all(`${TUS_PATH}/*`, handleTus);

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // production used '*'; Apache also sets it for /pbox
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',  
  credentials: true, 
}));

// Handle preflight requests
app.options('*', cors());

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/shareable-links', shareableLinkRoutes );
app.use('/api/videos', videoRoutes );
app.use('/api/sync', syncRoutes);
app.use('/api/drive', require('./routes/drive'));

// Example route to delete a user by ID
app.delete('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

const PORT = process.env.PORT || 5000;

// Big uploads on slow connections can take far longer than Node's default
// 5-minute requestTimeout (Node >= 18), which kills them mid-transfer.
// Default: 6 hours. Override with UPLOAD_TIMEOUT_MS (0 disables the limit).
const UPLOAD_TIMEOUT_MS = Number(process.env.UPLOAD_TIMEOUT_MS ?? 6 * 60 * 60 * 1000);

sequelize.sync()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (request timeout: ${UPLOAD_TIMEOUT_MS} ms)`);
    });
    server.requestTimeout = UPLOAD_TIMEOUT_MS; // whole request, body included
    server.timeout = 0;                        // no socket inactivity cutoff
    // headersTimeout (60 s) is left as-is: it only covers receiving headers.
  })
  .catch(err => console.log('Error: ' + err));


  module.exports = app; // Exporting app for testing purposes
