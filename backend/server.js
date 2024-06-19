const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();

// Middleware to enable CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Export app and a function to start the server
module.exports = {
  app,
  startServer: async () => {
    try {
      await sequelize.sync();
      return app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1); // Exit with error
    }
  },
};
