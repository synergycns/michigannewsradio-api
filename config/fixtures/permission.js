var Promise = require('bluebird');

var grants = {
  Administrator: [
    { action: 'create' },
    { action: 'read' },
    { action: 'update' },
    { action: 'delete' }
  ],
  User: [
    { action: 'create' },
    { action: 'read' }
  ],
  Public: [
    { action: 'read' }
  ]
};

var modelRestrictions = {
  User: [
    'Role',
    'Permission',
    'User'
  ],
  Public: [
    'Role',
    'Permission',
    'User',
    'Model'
  ]
};

// TODO let users override this in the actual model definition

/**
 * Create default Role permissions
 */
exports.create = function (roles, models, admin) {
  return Promise.all([
    grantAdminPermissions(roles, models, admin),
    grantRegisteredPermissions(roles, models, admin)
  ])
  .then(function (permissions) {
    //sails.log('created', permissions.length, 'permissions');
    return permissions;
  });
};

function grantAdminPermissions (roles, models, admin) {
  var adminRole = _.find(roles, { name: 'Administrator' });
  var permissions = _.flatten(_.map(models, function (modelEntity) {
    var model = sails.models[modelEntity.identity];

    return _.map(grants.Administrator, function (permission) {
      var newPermission = {
        model: modelEntity.id,
        action: permission.action,
        role: adminRole.id,
      };
      return Permission.findOrCreate(newPermission, newPermission);
    });
  }));

  return Promise.all(permissions);
}

function grantRegisteredPermissions (roles, models, admin) {
  var registeredRole = _.find(roles, { name: 'User' });
  var permissions = [
    {
      model: _.find(models, { name: 'Commercial' }).id,
      action: 'read',
      role: registeredRole.id
    },
    /*
    {
      model: _.find(models, { name: 'ContentCategory' }).id,
      action: 'read',
      role: registeredRole.id
    },
    */
    {
      model: _.find(models, { name: 'ContentFeed' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'ContentFile' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'Download' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'NavigationItem' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'Schedule' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'ScheduleSpots' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'Permission' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'Model' }).id,
      action: 'read',
      role: registeredRole.id
    },
    {
      model: _.find(models, { name: 'User' }).id,
      action: 'update',
      role: registeredRole.id,
      relation: 'owner'
    },
    {
      model: _.find(models, { name: 'User' }).id,
      action: 'read',
      role: registeredRole.id,
      relation: 'owner'
    }
  ];

  return Promise.all(
    _.map(permissions, function (permission) {
      return Permission.findOrCreate(permission, permission);
    })
  );
}
