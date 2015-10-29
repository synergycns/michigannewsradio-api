/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 */
var _ = require('lodash');
var oPromise = require('bluebird');

module.exports = {
  listpermissions: function(req, res) {

    sails.log.info('User', req.user);

    // Get the user, their role(s) & their user-specific permissions
    User.findOne(req.user.id)
      .populate('roles')
      .populate('permissions')
      .then(function(oUser) {

        // Create promise
        var oDefer = oPromise.defer();

        // Check for user-specific permissions to populate
        if(oUser.permissions.length) {
          Permission.find({ id: _.pluck(oUser.permissions, 'id') })
            .populate('criteria')
            .then(function(aoPermissions) {
              oUser.permissions = aoPermissions;
              oDefer.resolve(oUser);
            })
            .catch(function (oError) {
              sails.log.error('[UserController:listpermissions]', oError);
              oDefer.reject(oError);
            })
        } else {
          oDefer.resolve(oUser);
        }

        return oDefer.promise;

      })
      .then(function(oUser) {

        // Create promise
        var oDefer = oPromise.defer();

        // Get Role(s)
        Role.find({ id: _.pluck(oUser.roles, 'id') })
          .populate('permissions')
          .then(function(aoRolesPopulated) {

            //sails.log.info('Populated roles', aoRolesPopulated);
            oUser.roles = aoRolesPopulated;

            // Setup array to hold all permissions
            var aoRolePermissions = [];

            // Iterate Roles, get each Role's permissions and add to array
            _.each(aoRolesPopulated, function(oRolePopulated) {
              _.each(oRolePopulated.permissions, function(oRolePermission) {
                aoRolePermissions.push(oRolePermission);
              })
            });

            //sails.log.info('Permissions for Role(s)', aoRolePermissions);

            Permission.find({ id: _.pluck(aoRolePermissions, 'id') })
              .populate('criteria')
              .then(function(aoPermissionsPopulated) {
                oUser.permissions = _.union(oUser.permissions, aoPermissionsPopulated);
                oDefer.resolve(oUser);
              });
          })
          .catch(function(oError) {
            sails.log.error('[UserController:listpermissions]', oError);
            oDefer.reject(oError);
          });

        return oDefer.promise;

      })
      .then(function(oUser) {
        // Return
        return res.ok({ aoPermissions: oUser.permissions });
      })
      .catch(function(oError) {
        sails.log.error('[UserController:listpermissions]', oError);
        return res.negotiate(oError);
      })
  }
};
