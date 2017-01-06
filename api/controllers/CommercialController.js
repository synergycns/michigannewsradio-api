/**
 * CommercialController
 *
 * @description :: Server-side logic for managing Commercials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  fnUploadTmpFile: function(req, res) {

    sails.log.info('Handling temp commercial upload...');
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
          return res.badRequest('No commercial was uploaded');
        }

        sails.log.info('Temp commercial upload complete!', aoUploadedFiles);

        return res.ok({
          oUploadedFile: aoUploadedFiles[0]
        });
      });
  }
};

