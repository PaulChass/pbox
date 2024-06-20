const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pbox', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8' // Change to utf8 if it was cesu8
  },
});

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

module.exports = sequelize;
