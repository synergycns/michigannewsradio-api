/**
* AudioCategory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Categories of Audio Content',
  autoPK: true,

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    feeds: {
      collection: 'AudioFeed',
      via: 'category'
    },
    files: {
      collection: 'AudioFile',
      via: 'category'
    }
  }

};

