/**
 * AudioFileController
 *
 * @description :: Server-side logic for managing Audiofiles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
	upload: function(req, res) {
    var PK = actionUtil.requirePk(req);
    AudioFile.findOne({id: PK})
      .then(function(audioFile) {
        var d = new Date();
        var bucket = 'mnraudio';
        var file = d.getFullYear + '/' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getHours() + '/' + req.file('audioFile').filename;
        StorageService
          .upload(req.file('audioFile'), bucket + ':' + file)
          .then(function(uploadRes) {
            sails.log.info('Uploaded file: ' + uploadRes);
            audioFile.file = file;
            audioFile.save()
              .then(function(audioFile) {
                return res.ok({
                  upload: uploadRes,
                  audioFile: audioFile
                });
              })
          })
          .catch(function (e) {
            sails.log.error(e);
            return res.serverError(e);
          })
      })
      .catch(function(e) {
        return res.badRequest(null, null, 'Could not find the Audio File specified!');
      })

  }
};

