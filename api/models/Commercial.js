/**
 * Commercial.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Commercials to be used with distribution & affidavits',
  autoPK: true,

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
  }

};
