/**
* AudioFeed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Feeds/groups of Audio Files',
  autoCreatedBy: false,
  autoPK: true,

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    date: {
      type: 'datetime',
      required: true
    },
    producer: {
      type: 'string',
      required: true
    },
    category: {
      model: 'AudioCategory',
      required: true
    },
    files: {
      collection: 'AudioFile',
      via: 'feed'
    }
  }

};

