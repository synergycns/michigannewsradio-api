/**
 * Route Mappings
 *
 * Your routes map URLs to views and controllers
 */

module.exports.routes = {
  'get /': 'PingController.index',
  'get /user/:id/permission/:modelid/:action': 'UserController.permission',
  'post /contentfile/uploadfile': 'ContentFileController.uploadfile'
};
