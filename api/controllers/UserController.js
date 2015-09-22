/**
 * UserController
 * @description :: Server-side logic for manage users
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
  permission: function(req, res) {
    var PK = actionUtil.requirePk(req);
    User.findOne(PK)
      .then(function(user) {

        var options = {};
        options.action = req.param('action');
        options.model = {};
        options.model.id = req.param('modelid');
        options.user = user;
        PermissionService.findModelPermissions(options)
          .then(function(permissions) {
            return res.ok({
              allowed: Boolean(permissions.length),
              permissions: permissions
            });
          })
          .catch(function(e) {
            sails.log.error(e);
            return res.serverError(e);
          });

      })
      .catch(function(e) {
        return res.badRequest(null, null, 'Could not find the User specified!');
      });
  }
};
