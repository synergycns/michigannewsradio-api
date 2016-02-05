/**
 * ContentFile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var oFs = require('fs');

module.exports = {

  description: 'Individual Content Files',
  attributes: {
    file: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    caption: {
      type: 'string',
      required: true
    },
    description: {
      type: 'text',
      required: true
    },
    length: {
      type: 'string',
      required: true,
      size: 8
    },
    category: {
      model: 'ContentCategory'
    },
    feed: {
      model: 'ContentFeed'
    },
    downloads: {
      collection: 'Download',
      via: 'file'
    }
  },
  afterDestroy: function(aoDestroyed, fnNext) {
    for(var i = 0; i < aoDestroyed.length; i++) {
      if(aoDestroyed[i].file.substr(aoDestroyed[i].file.length - 3).toLowerCase() == 'mp3') {
        StorageService.remove('mnrdistribution:' + aoDestroyed[i].file.substr(0, aoDestroyed[i].file.length - 3) + 'wav');
      }
      StorageService.remove('mnrdistribution:' + aoDestroyed[i].file);
    }
    fnNext();
  },
  beforeCreate: function(oContentFile, fnNext) {
    if(oContentFile.oTmpFile) {
      if(oFs.statSync(oContentFile.oTmpFile.fd).isFile()) {
        this.fnPublishTmpFile(oContentFile, fnNext);
      } else {
        sails.log.error('Temporary file could not be found (create)', oContentFile.oTmpFile);
        fnNext({ message: 'Temporary file could not be found' });
      }
    } else {
      fnNext();
    }
  },
  beforeUpdate: function(oContentFile, fnNext) {
    if(oContentFile.oTmpFile && oContentFile.oTmpFile.hasOwnProperty('fd')) {
      if(oFs.statSync(oContentFile.oTmpFile.fd).isFile()) {
        this.fnPublishTmpFile(oContentFile, fnNext);
      } else {
        sails.log.error('Temporary file could not be found (update)', oContentFile.oTmpFile);
        fnNext({ message: 'Temporary file could not be found' });
      }
    } else {
      fnNext();
    }
  },
  fnPublishTmpFile: function(oContentFile, fnNext) {

    // Remove old file
    if(oContentFile.file && oContentFile.file !== 'oTmpFile') {
      if(oContentFile.file.substr(oContentFile.file.length - 3).toLowerCase() == 'mp3') {
        sails.log.info('Removing wav: ' + oContentFile.file);
        StorageService.remove('mnrdistribution:' + oContentFile.file.substr(0, oContentFile.file.length - 3) + 'wav');
      }
      sails.log.info('Removing: ' + oContentFile.file);
      StorageService.remove('mnrdistribution:' + oContentFile.file);
    }

    // Get the category
    ContentCategory.findOne(oContentFile.category)
      .then(function(oDestinationCategory) {

        // Setup output folder
        var oDate = new Date();
        var sBucket = 'mnrdistribution';
        var sOutputFilename = oDestinationCategory.outputFolder + '/' + oDate.getFullYear() + '/' + ("0" + (oDate.getMonth() + 1)).slice(-2) + '/' + ("0" + oDate.getDate()).slice(-2) + '/' + ("0" + oDate.getHours()).slice(-2) + '/' + oContentFile.oTmpFile.filename;

        sails.log.info('Uploading to S3', sOutputFilename);

        // Upload to S3
        StorageService
          .upload(oContentFile.oTmpFile.fd, sBucket + ':' + sOutputFilename)
          .then(function(oUploaded) {

            sails.log.info('Uploaded file: ', oUploaded);
            oContentFile.file = sOutputFilename;

            // Check if there is a legacy output folder
            if(oDestinationCategory.legacyOutputFolder && !oContentFile.bTesting) {

              sails.log.info('Uploading to S3 (legacy)');

              StorageService
                .upload(oContentFile.oTmpFile.fd, 'mnrftproot' + ':' + oDestinationCategory.legacyOutputFolder + '/' + oContentFile.oTmpFile.filename)
                .then(function(oUploadLegacy) {

                  sails.log.info('Uploaded legacy file: ', oUploadLegacy);

                  // Check if there is a "current" setting
                  if(oDestinationCategory.legacyCurrentFilename && !oContentFile.bTesting) {

                    sails.log.info('Uploading to S3 (legacy current)');

                    StorageService
                      .upload(oContentFile.oTmpFile.fd, 'mnrftproot' + ':' + oDestinationCategory.legacyOutputFolder + '/Current/' + oDestinationCategory.legacyCurrentFilename + '.mp3')
                      .then(function() {
                        oFs.unlink(oContentFile.oTmpFile.fd);
                        fnNext();
                      })
                      .catch(function(oError) {
                        sails.log.error('Error (legacy current)', oError);
                        fnNext(oError);
                      });

                  } else {
                    oFs.unlink(oContentFile.oTmpFile.fd);
                    fnNext();
                  }
                })
                .catch(function(oError) {
                  sails.log.error('Error (legacy)', oError);
                  fnNext(oError);
                });
            } else {
              oFs.unlink(oContentFile.oTmpFile.fd);
              fnNext();
            }
          })
          .catch(function (oError) {
            sails.log.error('Error', oError);
            fnNext(oError);
          });
      })
      .catch(function(oError) {
        sails.log.error('Error finding category', oError);
        fnNext(oError);
      });
  }
};
