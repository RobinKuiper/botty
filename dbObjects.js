const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data/database.sqlite',
});

const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Channels = require('./models/Channels')(sequelize, Sequelize.DataTypes);

Users.prototype.addExperience = async function(xp) {
    const user = await Users.findOne({
        where: { userID: this.user_id }
    });

    if(user){
        user.experience += xp;
        return user.save();
    }

    return Users.create({ userID: this.user_id });
}

module.exports = { Users, Channels };