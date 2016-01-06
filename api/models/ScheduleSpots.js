/**
* ScheduleSpots.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  //migrate: 'alter',

  description: 'Scheduled spots and their associated information',
  attributes: {
    advertiser: {
      type: 'string',
      required: true
    },
    commercial: {
      model: 'Commercial',
      //required: true
      required: false
    },
    date: {
      type: 'date',
      required: true
    },
    datetime: {
      type: 'datetime',
      required: true
    },
    length: {
      type: 'integer',
      required: true,
      size: 2
    },
    material: {
      type: 'string',
      required: true
    },
    network: {
      type: 'string',
      required: true,
      defaultsTo: 'Michigan News Radio'
    },
    position: {
      type: 'integer',
      required: true,
      size: 2
    },
    schedule: {
      model: 'Schedule',
      required: true
    }

  }

};

