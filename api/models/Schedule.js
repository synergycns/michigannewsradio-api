/**
* Schedule.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Schedule containing spots that should be played on specific dates at specific times',
  autoPK: true,
  autoCreatedBy: false,

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

  }

};

