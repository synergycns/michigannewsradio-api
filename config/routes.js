/**
 * Route Mappings
 *
 * Your routes map URLs to views and controllers
 */

module.exports.routes = {
  'get /': 'PingController.index',
  'post /commercial/uploadtmpfile': 'CommercialController.fnUploadTmpFile',
  'get /contentfeed/activity': 'ContentFeedController.activity',
  'get /contentfile/activity': 'ContentFileController.activity',
  'get /schedule/pdf': 'ScheduleController.pdf',
  'get /user/listpermissions': 'UserController.listpermissions',
  'post /contentfile/uploadtmpfile': 'ContentFileController.fnUploadTmpFile'
};
