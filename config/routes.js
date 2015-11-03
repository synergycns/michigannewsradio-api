/**
 * Route Mappings
 *
 * Your routes map URLs to views and controllers
 */

module.exports.routes = {
  'get /': 'PingController.index',
  'get /contentfeed/activity': 'ContentFeedController.activity',
  'get /contentfile/activity': 'ContentFileController.activity',
  'get /user/listpermissions': 'UserController.listpermissions',
  'post /contentfile/uploadtmpfile': 'ContentFileController.fnUploadTmpFile'
};
