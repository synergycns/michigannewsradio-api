/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 */

module.exports = {
  listpermissions: function(req, res) {

    sails.log.info('User', req.user);

    // Get the user, their role(s) & their user-specific permissions
    User.findOne(req.user.id)
      .populate('roles')
      .populate('permissions')
      .then(function(oUser) {

        //sails.log.info('Found user', oUser);

        // Setup return array for permissions
        var aoReturnPermissions = [];

        // Check for user-specific permissions & add to return
        if(oUser.permissions.length) {
          oUser.permissions.forEach(function(oUserPermission) {
            aoReturnPermissions.push(oUserPermission);
          });
        }

        // Setup array for role id(s)
        var aoRoleIds = [];

        // Setup array for role id(s)
        oUser.roles.forEach(function(oRole) {
          aoRoleIds.push(oRole.id);
        });

        // Get Role(s)
        Role.find(aoRoleIds)
          .populate('permissions')
          .then(function(aoRolesPopulated) {

            //sails.log.info('Populated roles', aoRolesPopulated);

            // Iterate roles
            aoRolesPopulated.forEach(function(oRolePopulated) {
              // Check for role-specific permissions & add to return
              if(oRolePopulated.permissions.length) {
                oRolePopulated.permissions.forEach(function(oRolePermission) {
                  aoReturnPermissions.push(oRolePermission);
                });
              }
            });

            // Return
            return res.ok({ aoPermissions: aoReturnPermissions });

          })
          .catch(function(oError) {
            sails.log.error('[UserController:listpermissions]', oError);
            return res.negotiate(oError);
          })

      })
      .catch(function(oError) {
        sails.log.error('[UserController:listpermissions]', oError);
        return res.negotiate(oError);
      })
  }
};
