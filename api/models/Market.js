/**
 * Market.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Markets for Stations/Users',
  attributes: {
    commercials: {
      collection: 'Commercial',
      via: 'markets'
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    users: {
      collection: 'User',
      via: 'markets'
    }
  }

};
