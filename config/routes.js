/**
 * Route Mappings
 *
 * Your routes map URLs to views and controllers
 */

module.exports.routes = {
  'get /': 'PingController.index',
  'post /audioFile/:id/upload': 'AudioFileController.upload',
  'get /user/:id/permission/:modelid/:action': 'UserController.permission'
};
