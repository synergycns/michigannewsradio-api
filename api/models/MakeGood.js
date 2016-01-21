/**
 * Affidavit.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  //migrate: 'alter',

  description: 'Make-good entries for affiliate affidavits',
  attributes: {
    affidavit: {
      model: 'Affidavit',
      required: true
    },
    spot: {
      model: 'ScheduleSpots',
      required: true
    },
    datetime: {
      type: 'datetime'
    },
    didNotAir: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    reason: {
      type: 'string'
    }
  }
};

