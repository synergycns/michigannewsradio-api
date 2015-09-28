/**
* ContentCategory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Categories of Content',
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
    qid: {
      type: 'integer',
      required: true,
      unique: true,
      index: true
    },
    breakType: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    outputFolder: {
      type: 'string',
      required: true
    },
    legacyOutputFolder: {
      type: 'string'
    },
    feeds: {
      collection: 'ContentFeed',
      via: 'category'
    },
    files: {
      collection: 'ContentFile',
      via: 'category'
    }
  }
};

