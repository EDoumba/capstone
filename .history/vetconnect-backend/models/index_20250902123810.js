const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize( 
  'database', 'username', 'password',
  //config.database,config.username,config.password,
  {
    //host: config.host, dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.VetAvailability = require('./VetAvailability')(sequelize, Sequelize);
db.Appointment = require('./Appointment')(sequelize, Sequelize);
db.Review = require('./Review')(sequelize, Sequelize);
db.Favorite = require('./Favorite')(sequelize, Sequelize);
db.Message = require('./Message')(sequelize, Sequelize);
db.Notification = require('./Notification')(sequelize, Sequelize);
db.Language = require('./Language')(sequelize, Sequelize);
db.UserPreference = require('./UserPreference')(sequelize, Sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;