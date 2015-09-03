var _ = require('lodash');
var Promise = require("bluebird");

/** @module User */
module.exports = {
  attributes: {
    firstName: {
      type: 'string',
      defaultsTo: ''
    },
    lastName: {
      type: 'string',
      defaultsTo: ''
    },
    username: {
      type: 'string',
      unique: true,
      index: true,
      required: true,
      alphanumericdashed: true
    },
    email: {
      type: 'email',
      required: true,
      unique: true,
      index: true
    },
    password: {
      type: 'string'
    },
    roles: {
      collection: 'Role',
      via: 'users',
      dominant: true
    },
    permissions: {
      collection: "Permission",
      via: "user"
    },
    socialProfiles: {
      type: 'object'
    },
    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      return user;
    }
  },
  /**
   * Attach default Role to a new User
   */
  afterCreate: [
    function setOwner (user, next) {
      sails.log('User.afterCreate.setOwner', user);
      User
        .update({ id: user.id }, { owner: user.id })
        .then(function (user) {
          next();
        })
        .catch(function (e) {
          sails.log.error(e);
          next(e);
        });
    },
    function attachDefaultRole (user, next) {
      Promise.bind({ }, User.findOne(user.id)
          .populate('roles')
          .then(function (user) {
            this.user = user;
            return Role.findOne({ name: 'registered' });
          })
          .then(function (role) {
            this.user.roles.add(role.id);
            return this.user.save();
          })
          .then(function (updatedUser) {
            sails.log.silly('role "registered" attached to user', this.user.username);
            next();
          })
          .catch(function (e) {
            sails.log.error(e);
            next(e);
          })
      );
    }
  ],
  beforeCreate: function (user, next) {
    if (_.isEmpty(user.username)) {
      user.username = user.email;
    }
    user.password = HashService.bcrypt.hashSync(user.password);
    next();
  },
  beforeUpdate: function (values, next) {
    if(values.password) {
      var blnIsHash = HashService.isBCryptHash(values.password);
      if(!blnIsHash) {
        values.password = HashService.bcrypt.hashSync(values.password);
      }
    }
    next();
  }
};
