/**
 * ContentFileController
 *
 * @description :: Server-side logic for managing content files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
	upload: function(req, res) {
    var PK = actionUtil.requirePk(req);
    ContentFile.findOne(PK)
      .then(function(contentFile) {
        var d = new Date();
        var offset = ((d.getMonth() + 1) < 6 ) ? 300 : 240;
        d.setTime(d.getTime() - offset*60*1000);
        var bucket = 'mnrdistribution';
        var file = d.getFullYear() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + ("0" + d.getDate()).slice(-2) + '/' + ("0" + d.getHours()).slice(-2) + '/' + req.file('contentFile').filename
        StorageService
          .upload(req.file('contentFile'), bucket + ':' + file)
          .then(function(uploadRes) {
            sails.log.info('Uploaded file: ', uploadRes);
            contentFile.file = file;
            contentFile.save()
              .then(function(contentFile) {
                return res.ok({
                  upload: uploadRes,
                  contentFile: contentFile
                });
              })
          })
          .catch(function (e) {
            sails.log.error(e);
            return res.serverError(e);
          })
      })
      .catch(function(e) {
        return res.badRequest(null, null, 'Could not find the Content File specified!');
      })

  }
};

