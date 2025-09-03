module.exports = (sequelize, DataTypes) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    language_code: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      references: {
        model: 'languages',
        key: 'code'
      }
    },
    email_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserPreference.associate = function(models) {
    UserPreference.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    UserPreference.belongsTo(models.Language, {
      foreignKey: 'language_code',
      as: 'language'
    });
  };

  return UserPreference;
};