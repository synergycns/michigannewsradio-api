/**
 * Route Mappings
 *
 * Your routes map URLs to views and controllers
 */

module.exports.routes = {
  'get /': 'PingController.index',
  'get /user/listpermissions': 'UserController.listpermissions',
  'post /contentfile/uploadtmpfile': 'ContentFileController.fnUploadTmpFile'
};
