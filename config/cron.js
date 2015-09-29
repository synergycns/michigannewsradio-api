/**
 * Cron configuration where you can define cron tasks with range time and callbacks.
 *
 * Look here for detailed examples https://github.com/ghaiklor/sails-hook-cron
 */
var AWS = require('aws-sdk');
var Lambda = new AWS.Lambda({ region: 'us-east-1' });

module.exports.cron = {
  cleanupPublicFTP: {
    schedule: '40 18 * * *',
    onTick: function() {
      sails.log.info('Cleaning public FTP server...');
      Lambda.invoke({ FunctionName: "fnCleanupPublicFTP" }, function(err, data) {
        if(err) {
          sails.log.error('An error occurred while trying to cleanup the public FTP server!', err);
        } else {
          sails.log.success('FTP server cleaned!', data);
        }
      });
    },
    timezone: 'America/New_York',
    start: true
  }
};
