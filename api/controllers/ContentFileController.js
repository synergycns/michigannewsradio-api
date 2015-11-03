/**
 * ContentFileController
 *
 * @description :: Server-side logic for managing content files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  activity: function(oReq, oRes) {
    ContentFile.query('SELECT HOUR(createdAt) as iHour, COUNT(id) AS iTotal FROM contentfile WHERE DATE(createdAt) = DATE(NOW()) GROUP BY HOUR(createdAt)',
      function(oError, aoResults) {
        if(oError) {
          sails.log.error('Error', oError);
          return oRes.negotiate(oError);
        }
        return oRes.ok(aoResults);
      });
  },
	fnUploadTmpFile: function(req, res) {

    sails.log.info('Handling temp file upload...');
    sails.log.info(req.body);

    // Handle incoming upload
    req.file('file').upload({
        maxBytes: 10000000
      },
      function whenDone(oError, aoUploadedFiles) {
        if (oError) {
          return res.negotiate(oError);
        }

        // If no files were uploaded, respond with an error.
        if (aoUploadedFiles.length === 0){
          return res.badRequest('No file was uploaded');
        }

        sails.log.info('Temp file upload complete!', aoUploadedFiles);

        return res.ok({
          oUploadedFile: aoUploadedFiles[0]
        });

        /*
        // Get the category
        ContentCategory.findOne(req.body.category)
          .then(function(oDestinationCategory) {

            // Setup output folder
            var d = new Date();
            //var offset = ((d.getMonth() + 1) < 6 ) ? 300 : 240;
            //d.setTime(d.getTime() - offset*60*1000);
            var bucket = 'mnrdistribution';
            var file = oDestinationCategory.outputFolder + '/' + d.getFullYear() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + ("0" + d.getDate()).slice(-2) + '/' + ("0" + d.getHours()).slice(-2) + '/' + aoUploadedFiles[0].filename;

            sails.log.info('Uploading to S3', file);

            // Upload to S3
            StorageService
              .upload(aoUploadedFiles[0].fd, bucket + ':' + file)
              .then(function(uploadRes) {

                sails.log.info('Uploaded file: ', uploadRes);

                // Check if there is a legacy output folder
                if(oDestinationCategory.legacyOutputFolder) {

                  sails.log.info('Uploading to S3 (legacy)');

                  StorageService
                    .upload(aoUploadedFiles[0].fd, 'mnrftproot' + ':' + oDestinationCategory.legacyOutputFolder + '/' + aoUploadedFiles[0].filename)
                    .then(function(oUploadLegacy) {

                      sails.log.info('Uploaded legacy file: ', oUploadLegacy);

                      // Check if there is a "current" setting
                      if(oDestinationCategory.legacyCurrentFilename) {

                        sails.log('Uploading to S3 (legacy current)');

                        StorageService
                          .upload(aoUploadedFiles[0].fd, 'mnrftproot' + ':' + oDestinationCategory.legacyOutputFolder + '/Current/' + oDestinationCategory.legacyCurrentFilename + '.mp3')
                          .then(function(oUploadLegacyCurent) {
                            return res.ok({
                              aoUploadedFiles: aoUploadedFiles,
                              sBucket: bucket,
                              sLegacy: oUploadLegacy.ETag,
                              sLegacyCurrent: oUploadLegacyCurent.ETag,
                              sOutputFilename: file,
                              ETag: uploadRes.ETag
                            });
                          })
                          .catch(function(oError) {
                            sails.log.error('Error (legacy current)', oError);
                            return res.negotiate(oError);
                          });

                      } else {
                        return res.ok({
                          aoUploadedFiles: aoUploadedFiles,
                          sBucket: bucket,
                          sLegacy: oUploadLegacy.ETag,
                          sOutputFilename: file,
                          ETag: uploadRes.ETag
                        });
                      }
                    })
                    .catch(function(oError) {
                      sails.log.error('Error (legacy)', oError);
                      return res.negotiate(oError);
                    });
                } else {
                  return res.ok({
                    aoUploadedFiles: aoUploadedFiles,
                    sBucket: bucket,
                    sOutputFilename: file,
                    ETag: uploadRes.ETag
                  });
                }
              })
              .catch(function (oError) {
                sails.log.error('Error', oError);
                return res.negotiate(oError);
              });
          })
          .catch(function(oError) {
            sails.log.error('Error finding category', oError);
            return res.negotiate(oError);
          });
          */
      });
  }
};

