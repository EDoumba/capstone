module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'languages',
    timestamps: false,
    underscored: true
  });

  Language.associate = function(models) {
    Language.hasMany(models.UserPreference, {
      foreignKey: 'language_code',
      as: 'user_preferences'
    });
  };

  return Language;
};