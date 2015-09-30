/**
 * Cron configuration where you can define cron tasks with range time and callbacks.
 *
 * Look here for detailed examples https://github.com/ghaiklor/sails-hook-cron
 */
var exec = require('child_process').exec;

module.exports.cron = {
  cleanupPublicFTP: {
    schedule: '0 21 * * *',
    onTick: function() {
      sails.log.info('Cleaning public FTP server...');
      var sCommand = "aws lambda invoke --function-name fnCleanupPublicFTP --region us-east-1 /tmp/output.txt";
      exec(sCommand, function(error) {
        if(error) {
          sails.log.error('Error cleaning public FTP server!', error);
        } else {
          sails.log.info('Public FTP server cleaned successfully!');
        }
      });
    },
    timezone: 'America/New_York',
    start: true
  }
};
