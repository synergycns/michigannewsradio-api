module.exports = function (sails) {
  return {
    identity: 'permissions',

    /**
     * Local cache of Model name -> id mappings to avoid excessive database lookups.
     */
    _modelCache: { },

    configure: function () {
      if (!_.isObject(sails.config.permissions)) sails.config.permissions = { };

      sails.config.blueprints.populate = false;
    },
    initialize: function (next) {
      sails.log.info('permissions: initializing hook');

      sails.after(sails.config.permissions.afterEvent, function () {
          installModelOwnership(sails);
      });

      sails.after('hook:orm:loaded', function () {
        Model.count()
          .then(function (count) {
            if (count == sails.models.length) return next();

            return initializeFixtures(sails)
              .then(function () {
                sails.emit('hook:permissions:loaded');
                next();
              });
          })
          .catch(function (error) {
            sails.log.error(error);
            next(error);
          });
      });
    }
  };
};

/**
 * Install the application. Sets up default Roles, Users, Models, and
 * Permissions, and creates an admin user.
 */
function initializeFixtures (sails) {
  return require('../../config/fixtures/model').createModels()
    .bind({ })
    .then(function (models) {
      this.models = models;

      sails.hooks['sails-permissions']._modelCache = _.indexBy(models, 'identity');

      return require('../../config/fixtures/role').create();
    })
    .then(function (roles) {
      this.roles = roles;
      var userModel = _.find(this.models, { name: 'User' });
      return require('../../config/fixtures/user').create(this.roles, userModel);
    })
    .then(function () {
      return User.findOne({ email: sails.config.permissions.adminEmail });
    })
    .then(function (user) {
      sails.log('sails-permissions: created admin user:', user);
      user.createdBy = user.id;
      user.owner = user.id;
      return user.save();
    })
    .then(function (admin) {
      return require('../../config/fixtures/permission').create(this.roles, this.models, admin);
    })
    .catch(function (error) {
      sails.log.error(error);
    });
}

function installModelOwnership (sails) {
  var models = sails.models;
  if (sails.config.models.autoCreatedBy === false) return;

  _.each(models, function (model) {
    if (model.autoCreatedBy === false) return;

    _.defaults(model.attributes, {
      createdBy: {
        model: 'User',
        index: true
      },
      owner: {
        model: 'User',
        index: true
      }
    });
  });
}
