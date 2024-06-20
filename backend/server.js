const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folder');

const User = require('./models/User'); // Assuming User model is defined
const app = express();

// Middleware setup
app.use(express.json());
app.use(bodyParser.json()); // You can remove this line if using express.json()
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
}));

// Handle preflight requests
app.options('*', cors());

app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);

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

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log('Error: ' + err));


  module.exports = app; // Exporting app for testing purposes
