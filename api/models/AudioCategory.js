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
    type: {
      type: 'string',
      index: true,
      required: true,
      enum: [
        'audio',
        'text'
      ],
      defaultsTo: 'audio'
    },
    breakType: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    outputFTPFolder: {
      type: 'string',
      required: true
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

