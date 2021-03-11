module.exports = (sequelize, DataTypes) => {
	return sequelize.define('channels', {
		channel_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};