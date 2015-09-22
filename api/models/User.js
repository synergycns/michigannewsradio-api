var _ = require('lodash');
var Promise = require("bluebird");

/** @module User */
module.exports = {

  settings: {
    sortfield: 'createdAt',
    sortdirection: 'DESC'
  },
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
    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      return user;
    }
  },
  columns: [
    {
      data: 'firstName',
      title: 'First Name'
    },
    {
      data: 'lastName',
      title: 'Last Name'
    },
    {
      data: 'username',
      title: 'Username'
    },
    {
      data: 'email',
      title: 'Email'
    },
    {
      data: null,
      title: '',
      edit: true,
      sortable: false
    },
    {
      data: null,
      title: '',
      delete: true,
      sortable: false
    }
  ],
  formschema: {
    type: 'object',
    title: 'User',
    properties: {
      firstName: {
        title: 'First Name',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'First Name',
          required: true
        }
      },
      lastName: {
        title: 'Last Name',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Last Name',
          required: true
        }
      },
      email: {
        title: 'Email',
        type: 'string',
        pattern: "^\\S+@\\S+\.\\S+$",
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Email Address',
          required: true,
          type: 'unique-property-validator'
        }
      },
      username: {
        title: 'Username',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Username',
          required: true,
          type: 'unique-property-validator'
        }
      },
      password: {
        title: 'Password',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Username',
          required: true,
          type: 'unique-property-validator'
        }
      },
      markets: {
        title: 'Market',
        type: 'number',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          fieldHtmlClass: 'col-sm-10',
          placeholder: 'Choose Market',
          required: true,
          type: 'strapselect',
          options: {
            httpGet: {
              url: 'USE_API:market'
            },
            map: {
              nameProperty: 'name',
              valueProperty: 'id'
            }
          }
        }
      },
      roles: {
        title: 'Role',
        type: 'number',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          fieldHtmlClass: 'col-sm-10',
          placeholder: 'Choose Role',
          required: true,
          type: 'strapselect',
          options: {
            httpGet: {
              url: 'USE_API:role'
            },
            map: {
              nameProperty: 'name',
              valueProperty: 'id'
            }
          }
        }
      }
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
            return Role.findOne({ name: 'User' });
          })
          .then(function (role) {
            this.user.roles.add(role.id);
            return this.user.save();
          })
          .then(function (updatedUser) {
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
