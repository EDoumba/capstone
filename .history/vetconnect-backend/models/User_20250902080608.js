const User = sequelize.define('User', {
  // columns...
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
});
