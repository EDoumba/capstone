module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
     //unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_type: {
      type: DataTypes.ENUM('client', 'vet', 'admin'),
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (user) => {
        if (user.user_type !== 'vet') {
          user.specialty = null;
        }
      }
    }
  }),

  indexes: [
      {
        name: 'uniq_users_email',
        unique: true,
        fields: ['email']
      }
    ]
  });

  

  User.associate = function(models) {
    User.hasMany(models.VetAvailability, {
      foreignKey: 'vet_id',
      as: 'availabilities'
    });
    
    User.hasMany(models.Appointment, {
      foreignKey: 'client_id',
      as: 'client_appointments'
    });
    
    User.hasMany(models.Appointment, {
      foreignKey: 'vet_id',
      as: 'vet_appointments'
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'client_id',
      as: 'written_reviews'
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'vet_id',
      as: 'received_reviews'
    });
    
    User.hasMany(models.Favorite, {
      foreignKey: 'client_id',
      as: 'favorites'
    });
    
    User.hasMany(models.Favorite, {
      foreignKey: 'vet_id',
      as: 'favorited_by'
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'sender_id',
      as: 'sent_messages'
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'receiver_id',
      as: 'received_messages'
    });
    
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
    
    User.hasOne(models.UserPreference, {
      foreignKey: 'user_id',
      as: 'preferences'
    });
  };

  return User;
};