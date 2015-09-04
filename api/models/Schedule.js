/**
* Schedule.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

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
    }

  }

};

