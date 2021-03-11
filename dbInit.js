const Sequelize = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data/database.sqlite'
});

require('./models/Users')(sequelize, Sequelize.DataTypes);
require('./models/Channels')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	logger.log('info', 'Database synced.');
	sequelize.close();
}).catch(console.error);