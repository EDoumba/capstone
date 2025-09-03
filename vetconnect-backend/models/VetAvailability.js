module.exports = (sequelize, DataTypes) => {
  const VetAvailability = sequelize.define('VetAvailability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'vet_availability',
    timestamps: false,
    underscored: true
  });

  VetAvailability.associate = function(models) {
    VetAvailability.belongsTo(models.User, {
      foreignKey: 'vet_id',
      as: 'vet'
    });
  };

  return VetAvailability;
};