/**
 * Cron configuration where you can define cron tasks with range time and callbacks.
 *
 * Look here for detailed examples https://github.com/ghaiklor/sails-hook-cron
 */
var exec = require('child_process').exec;
var dateFormat = require('dateformat');
require('date-util');

module.exports.cron = {
  cleanupPublicFTP: {
    schedule: '0 1 * * *',
    onTick: function() {
      sails.log.info('Cleaning public FTP server...');
      var sCommand = "aws lambda invoke --function-name fnCleanupPublicFTP --region us-east-1 /tmp/cleanupPublicFTP.txt";
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
  },
  sendReminderEmails: {
    schedule: '0 1 * * 4',
    //schedule: '* * * * *',
    onTick: function() {
      sails.log.info('Starting reminder Email cronjob...');
      // Setup the search date
      var oDate = new Date().strtotime('-7 days');

      sails.log.info('Search date: ' + dateFormat(oDate, 'yyyy-mm-dd HH:MM:ss'));
      // Look for last week's schedule (not the current one)
      Schedule.findOne({ where: { createdAt: { '<': dateFormat(oDate, 'yyyy-mm-dd HH:MM:ss') } }, sort: 'createdAt DESC' }).exec(function(oError, oSchedule) {
        if(oError) {
          sails.log.error('Error finding schedule', oError);
        } else {
          sails.log.info('Found schedule', oSchedule);
          // Get the users that are required to submit Affidavits
          User.find({ where: { id: { '>': '17' } } }).exec(function(oError, aoUsers) {
            if(oError) {
              sails.log.error('Error getting users', oError);
            } else {
              // Iterate users
              aoUsers.forEach(function(oUser) {
                //sails.log.silly('Checking if ' + oUser.firstName + ' ' + oUser.lastName + ' has submitted an affidavit...');
                // Look for Affidavit
                Affidavit.findOne({ where: { schedule: oSchedule.id, user: oUser.id } }).exec(function(oError, oAffidavit) {
                  if(oError) {
                    sails.log.error('Error getting affidavit', oError);
                  } else {
                    if(!oAffidavit) {

                      //sails.log.silly(oUser.firstName + ' ' + oUser.lastName + ' needs a reminder Email...');

                      // Setup payload
                      var oPayload = {};
                      oPayload.sName = oUser.firstName + ' ' + oUser.lastName;
                      oPayload.sEmail = oUser.email;
                      //oPayload.sEmail = 'ryan@synergy-cns.com';
                      oPayload.iScheduleId = oSchedule.id;
                      oPayload.sWeekBegin = dateFormat(oSchedule.begin, 'mm/dd/yy');
                      oPayload.sWeekEnd = dateFormat(oSchedule.end, 'mm/dd/yy');

                      //sails.log.silly('Payload', oPayload);

                      /*
                      var sCommand = "aws lambda invoke --function-name fnSendScheduleReminderEmail --payload '" + JSON.stringify(oPayload) + "' --region us-east-1 /tmp/sendReminderEmails.txt";
                      exec(sCommand, function(error) {
                        if(error) {
                          sails.log.error('Error sending reminder Emails!', error);
                        } else {
                          sails.log.info('Reminder Email sent successfully!');
                        }
                      });
                      */
                    }
                  }
                });
              });
            }
          });
        }
      });
    },
    timezone: 'America/New_York',
    start: true
  }
};
