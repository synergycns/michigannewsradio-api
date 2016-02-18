/**
* Schedule.js
*
* @description :: TODO: You might write a short summary of how oSchedule model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var PdfPrinter = require('../../node_modules/pdfmake/src/printer');
var dateFormat = require('dateformat');

module.exports = {

  //migrate: 'alter',

  description: 'Schedule containing spots that should be played on specific dates at specific times',
  attributes: {
    begin: {
      type: 'datetime',
      required: true
    },
    end: {
      type: 'datetime',
      required: true
    },
    locked: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    unlockedAt: {
      type: 'datetime'
    },
    spots: {
      collection: 'ScheduleSpots',
      via: 'schedule'
    }

  },
  afterDestroy: function(aoDestroyed, fnCallback) {
    ScheduleSpots.destroy({ schedule: _.pluck(aoDestroyed, 'id') }).exec(fnCallback);
  },
  pdf: function(oOptions, fnCallback) {

    // Check input params
    if(!oOptions.hasOwnProperty('oSchedule') || !oOptions.hasOwnProperty('oUser') || typeof oOptions.oSchedule !== 'object' || typeof oOptions.oUser !== 'object') {
      sails.log.error('Invalid input parameters provided! Please provide the Schedule and User objects!');
      var oError = new Error();
      oError.message = require('util').format('Invalid input parameters provided! Please provide the Schedule and User objects!');
      oError.status = 500;
      return fnCallback(oError);
    }

    sails.log.info('Beginning PDF creation...');

    // Setup local vars
    var oSchedule = oOptions.oSchedule;
    var oUser = oOptions.oUser;

    // Sort spots
    oSchedule.spots.sort(function(oItemA, oItemB) {
      if(oItemA.datetime < oItemB.datetime) { return -1; }
      if(oItemA.datetime > oItemB.datetime) { return 1; }
      return 0;
    });

    // Setup week strings
    var sWeekBegin = ('0' + oSchedule.begin.getMonth() + 1).slice(-2) + '/' + ('0' + oSchedule.begin.getDate()).slice(-2) + '/' + oSchedule.begin.getFullYear();
    var sWeekEnd = ('0' + oSchedule.end.getMonth() + 1).slice(-2) + '/' + ('0' + oSchedule.end.getDate()).slice(-2) + '/' + oSchedule.end.getFullYear();

    // Setup fonts
    var oFonts = {
      Roboto: {
        normal: './assets/fonts/Roboto-Regular.ttf',
        bold: './assets/fonts/Roboto-Medium.ttf',
        italics: './assets/fonts/Roboto-Italic.ttf',
        bolditalics: './assets/fonts/Roboto-Italic.ttf'
      }
    };

    // Define document
    var oDocDefinition = {
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      pageMargins: [ 40, 40, 40, 60 ],
      info: {
        title: 'Schedule and Clearance Affidavit for the Week of ' + sWeekBegin + ' to ' + sWeekEnd,
        author: 'Michigan News Network',
        subject: oUser.firstName + ' ' + oUser.lastName + ' - Schedule and Clearance Affidavit for the Week of ' + sWeekBegin + ' to ' + sWeekEnd
      },
      footer: function(currentPage, pageCount) {
        return [
          {
            table: {
              widths: ['*'],
              body: [[" "], [" "]]
            },
            layout: {
              hLineWidth: function(i, node) {
                return (i === 0 || i === node.table.body.length) ? 0 : 2;
              },
              vLineWidth: function(i, node) {
                return 0;
              },
              hLineColor: function() {
                return '#2F4050';
              }
            },
            margin: [40, 20, 40, 0]
          },
          {
            text: oUser.firstName + ' ' + oUser.lastName + ' Week of ' + sWeekBegin + ' to ' + sWeekEnd + ' Page ' + currentPage.toString() + ' of ' + pageCount,
            alignment: 'right',
            margin: [0, -10, 40, 0],
            fontSize: 8
          }
        ]
      },
      defaultStyle: {
        fontSize: 6,
        color: '#676A6C'
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        important: {
          color: '#EC4758'
        },
        link: {
          color: '#EC4758'
        },
        original: {
          alignment: 'right',
          fontSize: 14,
          bold: true
        },
        subheader: {
          color: '#18A689',
          fontSize: 16,
          bold: true
        },
        title: {
          fontSize: 10,
          bold: true
        },
        small: {
          fontSize: 6
        },
        tableHeader: {
          fontSize: 8,
          fillColor: '#E5E5E5',
          margin: [0, 5, 0, 5]
        },
        tableHeaderLeft: {
          fontSize: 8,
          fillColor: '#E5E5E5',
          margin: [5, 5, 0, 5]
        },
        tableText: {
          margin: [0, 5, 0, 5]
        },
        text: {
          fontSize: 8
        },
        timeSlot: {
          fontSize: 8,
          bold: true,
          margin: [5, 4, 0, 0]
        }
      },
      content: [
        {
          image: './assets/images/image001.jpg',
          margin: [0, -25, 0, 0]
        },
        {
          text: oUser.firstName + ' ' + oUser.lastName,
          style: 'header',
          margin: [200, -72, 0, 0]
        },
        {
          text: 'Original',
          style: 'original',
          margin: [200, -20, 0, 0]
        },
        {
          text: 'Michigan News Network',
          style: 'subheader',
          margin: [200, 0, 0, 0]
        },
        {
          text: 'Schedule and Clearance Affidavit for the Week of ' + sWeekBegin + ' to ' + sWeekEnd,
          style: 'title',
          margin: [200, 0, 0, 0]
        },
        {
          text: 'This schedule requires an Affidavit of Performance',
          style: 'small',
          margin: [200, 0, 0, 0]
        },
        {
          text: [
            'Please complete your online Affidavit by logging into your account at ',
            {
              text: 'https://app.michigannewsradio.com',
              link: 'https://app.michigannewsradio.com',
              style: 'link'
            }
          ],
          style: 'small',
          margin: [200, 0, 0, 0]
        },
        {
          text: 'MNN assumes all spots air during the scheduled hour provided, unless you specify a Make-Good date/time',
          style: 'small',
          margin: [200, 0, 0, 20]
        }
      ]
    };

    // Start organizing the spots for display
    var aoTimeSlots = [];
    var aDates = [];

    // Iterate
    oSchedule.spots.forEach(function(oItem) {
      // Create time slot object
      var oTimeSlotTime = {};
      oTimeSlotTime.sTime = dateFormat(oItem.datetime, 'h TT');
      oTimeSlotTime.sProgram  = oItem.program;
      oTimeSlotTime.sProgramTime = oTimeSlotTime.sProgram + '|' + oTimeSlotTime.sTime;
      oTimeSlotTime.aoDates = [];

      // Check if time slot exists in array
      var bTimeSlotExists = aoTimeSlots.filter(function(oTSItem) {
        return (oTSItem.sTime == oTimeSlotTime.sTime && oTSItem.sProgram == oTimeSlotTime.sProgram);
      });
      if(!bTimeSlotExists.length) {
        aoTimeSlots.push(oTimeSlotTime);
      } else {
        oTimeSlotTime = bTimeSlotExists[0];
      }

      // Create date object
      var oTimeSlotDate = {};
      oTimeSlotDate.sDate = dateFormat(oItem.datetime, 'ddd mm/dd');
      oTimeSlotDate.aoSpots = [];

      // Check if date exists in time slot
      var bDateExists = oTimeSlotTime.aoDates.filter(function(oDItem) {
        return (oDItem.sDate == oTimeSlotDate.sDate);
      });
      if(!bDateExists.length) {
        oTimeSlotTime.aoDates.push(oTimeSlotDate);
        if(aDates.indexOf(oTimeSlotDate.sDate) < 0) {
          aDates.push(oTimeSlotDate.sDate);
        }
      } else {
        oTimeSlotDate = bDateExists[0];
      }

      // Add spot to date
      oTimeSlotDate.aoSpots.push(oItem);
    });

    // Setup table
    var oTable = {};
    oTable.widths = [80];
    oTable.headerRows = 1;
    oTable.dontBreakRows = true;
    oTable.body = [
      [ { text: 'Scheduled Hour', style: 'tableHeaderLeft' } ]
    ];

    // Add remaining header columns to table
    aDates.forEach(function(oItem) {
      oTable.body[0].push({ text: oItem, style: 'tableHeader' });
      oTable.widths.push('*');
    });

    // Loop items
    aoTimeSlots.forEach(function(oTimeSlot) {
      var aRow = [];
      aRow.push({ text:  oTimeSlot.sTime + ' ' + oTimeSlot.sProgram, style: 'timeSlot' });

      // Create empty columns
      for(var i = 1; i < oTable.widths.length; i++) {
        aRow[i] = { text: '-', style: 'tableText' };
      }

      // Iterate spots
      oTimeSlot.aoDates.forEach(function(oTimeSlotDate, iIndex) {
        var sText = '';
        oTimeSlotDate.aoSpots.forEach(function(oSpot) {
          sText += oSpot.advertiser + '\n';
        });
        aRow[iIndex + 1] = { text: sText, style: 'tableText' };
      });
      oTable.body.push(aRow);
    });

    var aRowLines = [];
    var aRowLinesComplete = [];

    // Add table
    oDocDefinition.content.push({
      table: oTable,
      layout: {
        hLineWidth: function(i, node) {

          var iReturn = 0;

          if(aRowLines.indexOf(i) < 0)
          {
            aRowLines.push(i);
          } else {
            if(aRowLinesComplete.indexOf(i) < 0) {
              if (i == 1) {
                iReturn = 1;
              } else if (i < node.table.body.length && i !== 0) {
                iReturn = 0.5;
              }
              aRowLinesComplete.push(i);
            }
          }

          return iReturn;
        },
        vLineWidth: function() {
          return 0;
        },
        hLineColor: function() {
          return '#2F4050';
        }
      }
    });

    // Look for Affidavit information
    Affidavit.findOne({ schedule: oSchedule.id, user: oUser.id}).populate('makeGoods').exec(function(oError, oAffidavit) {
      if(oError) {
        sails.log.error('Error finding affidavit', oError);
        fnCallback(oError);
      } else {
        if(oAffidavit && oAffidavit.makeGoods.length > 0) {
          // Setup table for affidavits
          var oTable = {};
          oTable.widths = [125, 125, '*'];
          oTable.headerRows = 1;
          oTable.dontBreakRows = true;
          oTable.body = [
            [
              { text: 'Make Goods', style: 'tableHeaderLeft' },
              { text: '', style: 'tableHeader' },
              { text: '', style: 'tableHeader' }
            ]
          ];

          // Loop Make Goods
          oAffidavit.makeGoods.forEach(function(oMakeGood) {

            sails.log.silly('Found Make Good...');

            // Iterate spots
            for(var i = 0; i < oSchedule.spots.length; i++) {
              if(oSchedule.spots[i].id == oMakeGood.spot) {
                sails.log.silly('Found Spot for Make Good...');

                // Populate row and add to table
                oTable.body.push([
                  { text: dateFormat(oSchedule.spots[i].datetime, 'ddd mm/dd h TT'), style: 'tableText' },
                  { text: oSchedule.spots[i].advertiser, style: 'tableText' },
                  { text: (oMakeGood.didNotAir) ? 'Did NOT Run: ' + oMakeGood.reason : 'Ran as Make Good on: ' + dateFormat(oMakeGood.datetime, 'ddd mm/dd h TT'), style: (oMakeGood.didNotAir) ? ['tableText', 'important'] : 'tableText' }
                ]);
                break;
              }
            }
          });

          //sails.log.info('Adding Affidavit table', oTable);

          var aAffidavitRowLines = [];
          var aAffidavitRowLinesComplete = [];

          // Add table to document
          oDocDefinition.content.push({
            pageBreak: 'before',
            table: oTable,
            layout: {
              hLineWidth: function(i, node) {

                var iReturn = 0;

                if(aAffidavitRowLines.indexOf(i) < 0)
                {
                  aAffidavitRowLines.push(i);
                } else {
                  if(aAffidavitRowLinesComplete.indexOf(i) < 0) {
                    if (i == 1) {
                      iReturn = 1;
                    } else if (i < node.table.body.length && i !== 0) {
                      iReturn = 0.5;
                    }
                    aAffidavitRowLinesComplete.push(i);
                  }
                }
                return iReturn;
              },
              vLineWidth: function() {
                return 0;
              },
              hLineColor: function() {
                return '#2F4050';
              }
            }
          });
        }
      }

      // Build the PDF document
      sails.log.info('Creating PDF for User: ' + oUser.id + ' and Schedule: ' + oSchedule.id);
      var oPrinter = new PdfPrinter(oFonts);
      var oPDF = oPrinter.createPdfKitDocument(oDocDefinition);
      fnCallback(null, oPDF);
      oPDF.end();

    });
  }
};

