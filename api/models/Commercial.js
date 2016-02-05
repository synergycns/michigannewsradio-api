/**
 * Commercial.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var oFs = require('fs');

module.exports = {

  //migrate: 'alter',

  description: 'Commercials to be used with distribution & affidavits',
  attributes: {
    file: {
      type: 'string',
      required: true
    },
    isPSA: {
      type: 'boolean',
      defaultsTo: false
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    markets: {
      collection: 'Market',
      via: 'commercials'
    },
    materialCode: {
      type: 'string',
      required: true,
      unique: true,
      index: true
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
  beforeCreate: function(oCommercial, fnNext) {
    if(oCommercial.oTmpFile) {
      if(oFs.statSync(oCommercial.oTmpFile.fd).isFile()) {
        this.fnPublishTmpFile(oCommercial, fnNext);
      } else {
        sails.log.error('Temporary commercial could not be found (create)', oCommercial.oTmpFile);
        fnNext({ message: 'Temporary commercial could not be found' });
      }
    } else {
      fnNext();
    }
  },
  beforeUpdate: function(oCommercial, fnNext) {
    if(oCommercial.oTmpFile && oCommercial.oTmpFile.hasOwnProperty('fd')) {
      if(oFs.statSync(oCommercial.oTmpFile.fd).isFile()) {
        this.fnPublishTmpFile(oCommercial, fnNext);
      } else {
        sails.log.error('Temporary commercial could not be found (update)', oCommercial.oTmpFile);
        fnNext({ message: 'Temporary commercial could not be found' });
      }
    } else {
      fnNext();
    }
  },
  fnPublishTmpFile: function(oCommercial, fnNext) {

    // Remove old file
    if(oCommercial.file && oCommercial.file !== 'oTmpFile') {
      if(oCommercial.file.substr(oCommercial.file.length - 3).toLowerCase() == 'mp3') {
        sails.log.info('Removing wav (commercial): ' + oCommercial.file);
        StorageService.remove('mnrdistribution:' + oCommercial.file.substr(0, oCommercial.file.length - 3) + 'wav');
      }
      sails.log.info('Removing commercial: ' + oCommercial.file);
      StorageService.remove('mnrdistribution:' + oCommercial.file);
    }

    // Setup output folder
    var oDate = new Date();
    var sBucket = 'mnrdistribution';
    var sOutputFilename = 'Commercials/' + oDate.getFullYear() + '/' + ("0" + (oDate.getMonth() + 1)).slice(-2) + '/' + ("0" + oDate.getDate()).slice(-2) + '/' + ("0" + oDate.getHours()).slice(-2) + '/' + oCommercial.oTmpFile.filename;

    sails.log.info('Uploading to S3', sOutputFilename);

    // Upload to S3
    StorageService
      .upload(oCommercial.oTmpFile.fd, sBucket + ':' + sOutputFilename)
      .then(function(oUploaded) {

        sails.log.info('Uploaded file: ', oUploaded);
        oCommercial.file = sOutputFilename;

        sails.log.info('Uploading to FTP');
        StorageService
          .upload(oCommercial.oTmpFile.fd, 'mnrftproot' + ':Commercials/' + oCommercial.oTmpFile.filename)
          .then(function(oUploadedFTP) {

            sails.log.info('Uploaded to FTP: ', oUploadedFTP);
            oFs.unlink(oCommercial.oTmpFile.fd);
            fnNext();
          })
          .catch(function(oError) {
            sails.log.error('Error (FTP)', oError);
            fnNext(oError);
          });
      })
      .catch(function (oError) {
        sails.log.error('Error', oError);
        fnNext(oError);
      });
  }
};
