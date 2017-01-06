/**
 * ContentFileController
 *
 * @description :: Server-side logic for managing content files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  activity: function(oReq, oRes) {
    ContentFile.query("SELECT DATE(CONVERT_TZ(NOW(), 'UTC', 'US/Eastern')) as sDate , HOUR(createdAt) as iHour, COUNT(id) AS iTotal FROM contentfile WHERE DATE(createdAt) = DATE(CONVERT_TZ(NOW(), 'UTC', 'US/Eastern')) GROUP BY HOUR(createdAt)",
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
        maxBytes: 128000000
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
      });
  }
};

