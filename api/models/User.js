var _ = require('lodash');
var Promise = require("bluebird");
var oCrypto = require('crypto');

/** @module User */
module.exports = {

  attributes: {
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
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
      type: 'string',
      required: true
    },
    markets: {
      collection: 'Market',
      via: 'users'
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
    /* Start FTP-specific fields */
    accessed: {
      type: 'datetime'
    },
    count: {
      defaultsTo: 0,
      type: 'integer'
    },
    gid: {
      defaultsTo: 503,
      required: true,
      type: 'integer'
    },
    homedir: {
      defaultsTo: '/mnt/mnrftproot',
      required: true,
      type: 'string'
    },
    modified: {
      type: 'datetime'
    },
    passwd: {
      type: 'string'
    },
    shell: {
      defaultsTo: '/sbin/nologin',
      required: true,
      type: 'string'
    },
    uid: {
      defaultsTo: 501,
      required: true,
      type: 'integer'
    },
    userid: {
      type: 'string'
    },
    /* End FTP-specific fields */
    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      delete user.passwd;
      delete user.userid;
      return user;
    }
  },
  /**
   * Attach default Role to a new User
   */
  afterCreate: [
    function setOwner(user, next) {
      sails.log('User.afterCreate.setOwner', user);
      User
        .update({ id: user.id }, { owner: user.id })
        .then(function () {
          next();
        })
        .catch(function (e) {
          sails.log.error(e);
          next(e);
        });
    },
    function attachDefaultRole(user, next) {
      Promise.bind({ }, User.findOne(user.id)
          .populate('roles')
          .then(function (user) {
            this.user = user;
            return Role.findOne({ name: 'User' });
          })
          .then(function (role) {
            this.user.roles.add(role.id);
            return this.user.save();
          })
          .then(function () {
            sails.log.silly('role "User" attached to user', this.user.username);
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
    var sPlainPassword = user.password;
    var sMD5Password = oCrypto.createHash('md5').update(sPlainPassword).digest('hex');
    user.passwd = sMD5Password;
    user.password = HashService.bcrypt.hashSync(user.password);
    user.userid = user.username;
    next();
  },
  beforeUpdate: function (values, next) {
    if(values.password) {
      var blnIsHash = HashService.isBCryptHash(values.password);
      if(!blnIsHash) {
        var sPlainPassword = values.password;
        var sMD5Password = oCrypto.createHash('md5').update(sPlainPassword).digest('hex');
        values.passwd = sMD5Password;
        values.password = HashService.bcrypt.hashSync(values.password);
      }
    }
    next();
  }
};
