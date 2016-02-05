/**
 * ScheduleController
 *
 * @description :: Server-side logic for managing Schedules
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var async = require('async');
var base64 = require('base64-stream');
var fs = require('fs');
var pdfconcat = require('pdfconcat');

module.exports = {
  merge: function(oReq, oRes) {

    sails.log.info('Starting merge process...');

    // Check for PK
    var PK = actionUtil.requirePk(oReq);

    // Check params
    if(!oReq.param('aUserIds')) {
      var sMessage = require('util').format('Invalid input parameters provided! Please provide the User ID(s)!');
      sails.log.error('Invalid input parameters provided! Please provide the User ID(s)!');
      return oRes.serverError(sMessage, 500, sMessage);
    }

    // Check for temporary folders
    fs.stat('./.tmp', function(oError) {
      if(oError && oError.code == 'ENOENT') {
        fs.mkdirSync('./.tmp');
      }
    });

    // Get the schedule
    Schedule.findOne(PK).populate('spots').exec(function(oError, oSchedule) {
      if(oError) {
        sails.log.error('Error getting schedule', oError);
        return oRes.negotiate(oError);
      } else {

        // Setup array of user ids
        var aUserIds = oReq.param('aUserIds').split(',');

        sails.log.info('Getting Users with ', aUserIds);

        // Get the users
        User.find({ id: aUserIds }).exec(function(oError, aoUsers) {
          if(oError) {
            sails.log.error('Error getting Users', oError);
            return oRes.negotiate(oError);
          } else {

            // Array for PDF filenames
            var aFilenames = [];

            // Loop users and generate PDFs for each
            async.eachSeries(aoUsers, function(oUser, fnCallback) {

              // Setup options
              var oOptions = {};
              oOptions.oSchedule = oSchedule;
              oOptions.oUser = oUser;

              // Generate PDF
              Schedule.pdf(oOptions, function(oError, oPDF) {
                if(oError) {
                  sails.log.error('Error generating PDF', oError);
                  fnCallback(oError);
                } else {

                  // Current date and filename
                  var oDate = new Date();
                  var sFilename = oDate.getTime() + '.pdf';
                  var oOutput = fs.createWriteStream('./.tmp/' + sFilename);

                  // Write PDF to temporary file
                  oPDF.pipe(oOutput);
                  oOutput.on('close', function() {
                    sails.log.info('Wrote temporary PDF: ' + sFilename);
                    aFilenames.push('./.tmp/' + sFilename);

                    // Next item
                    fnCallback();
                  });
                }
              });
            }, function(oError) {
              if(oError) {
                sails.log.error('Error generating PDF', oError);
                return oRes.negotiate(oError);
              } else {

                // Handle single temp file
                if(aoUsers.length == 1) {

                  // Create stream
                  var oMerged = fs.createReadStream(aFilenames[0]);
                  oMerged.on('end', function () {
                    fs.unlink(aFilenames[0]);
                  });

                  // Output
                  return oMerged.pipe(base64.encode()).pipe(oRes);
                } else {

                  // Use pdfconcat to concat multiple temp files then pipe to response
                  var oDate = new Date();
                  var sOutputFile = './.tmp/' + oDate.getTime() + '.pdf';
                  pdfconcat(aFilenames, sOutputFile, function (oError) {
                    if (oError) {
                      sails.log.error(oError);
                    } else {

                      // Remove temporary files
                      aFilenames.forEach(function (sFilename) {
                        fs.unlink(sFilename);
                      });

                      // Create stream
                      var oMerged = fs.createReadStream(sOutputFile);
                      oMerged.on('end', function () {
                        fs.unlink(sOutputFile);
                      });

                      // Output
                      return oMerged.pipe(base64.encode()).pipe(oRes);
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  },
  pdf: function(oReq, oRes) {

    // Check for PK
    var PK = actionUtil.requirePk(oReq);

    sails.log.silly('Looking up schedule...');
    // Get schedule and associated spots
    Schedule.findOne(PK).populate('spots').exec(function(oError, oSchedule) {
      if (oError) {
        sails.log.error('Error finding Schedule', oError);
        return oRes.negotiate(oError);
      } else {

        // Setup options for PDF
        var oOptions = {};
        oOptions.oSchedule = oSchedule;
        oOptions.oUser = oReq.user;

        sails.log.silly('Schedule found!');

        // Create PDF
        Schedule.pdf(oOptions, function(oError, oPDF) {
          if(oError) {
            //sails.log.error('Error creating PDF', oError);
            return oRes.negotiate(oError);
          } else {
            sails.log.info('Piping PDF to response');
            return oPDF.pipe(base64.encode()).pipe(oRes);
          }
        });
      }
    });
  }
};

