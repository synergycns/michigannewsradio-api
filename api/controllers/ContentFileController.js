/**
 * ContentFileController
 *
 * @description :: Server-side logic for managing content files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
	uploadfile: function(req, res) {

    sails.log.info('Handling upload...');
    sails.log.info(req.body);

    req.file('file').upload({
        maxBytes: 10000000
      },
      function whenDone(err, aoUploadedFiles) {
        if (err) {
          return res.negotiate(err);
        }

        // If no files were uploaded, respond with an error.
        if (aoUploadedFiles.length === 0){
          return res.badRequest('No file was uploaded');
        }

        sails.log.info('Upload temp complete!', aoUploadedFiles);

        // Get the category
        ContentCategory.findOne(req.body.category)
          .then(function(oCategory) {

            // Setup output folder
            var d = new Date();
            //var offset = ((d.getMonth() + 1) < 6 ) ? 300 : 240;
            //d.setTime(d.getTime() - offset*60*1000);
            var bucket = 'mnrdistribution';
            var file = oCategory.outputFolder + '/' + d.getFullYear() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + ("0" + d.getDate()).slice(-2) + '/' + ("0" + d.getHours()).slice(-2) + '/' + aoUploadedFiles[0].filename

            sails.log.info('Uploading to S3', file);

            // Upload to S3
            StorageService
              .upload(aoUploadedFiles[0].fd, bucket + ':' + file)
              .then(function(uploadRes) {
                sails.log.info('Uploaded file: ', uploadRes);
                return res.ok({
                    aoUploadedFiles: aoUploadedFiles,
                    sBucket: bucket,
                    sOutputFilename: file,
                    ETag: uploadRes.ETag
                  });
              })
              .catch(function (e) {
                sails.log.error(e);
                return res.serverError(e);
              });
          })
          .catch(function(oError) {
            sails.log.error('Error finding category', oError);
            return res.serverError(oError);
          });
      });
  }
};

