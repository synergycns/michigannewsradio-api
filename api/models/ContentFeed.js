/**
* ContentFeed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Feeds/groups of Content Files',
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
    queued: {
      type: 'boolean',
      defaultsTo: false
    },
    category: {
      model: 'ContentCategory',
      required: true
    },
    files: {
      collection: 'ContentFile',
      via: 'feed'
    }
  }
};

