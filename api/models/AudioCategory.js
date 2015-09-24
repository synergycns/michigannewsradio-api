/**
* AudioCategory.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Categories of Audio Content',
  autoPK: true,
  settings: {
    sortfield: 'name',
    sortdirection: 'ASC'
  },
  attributes: {
    name: {
      type: 'string',
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
  },
  columns: [
    {
      data: 'id',
      title: '',
      visible: false
    },
    {
      data: 'name',
      title: 'Name'
    },
    {
      data: 'breakType',
      title: 'Break Type'
    },
    {
      data: null,
      title: '',
      edit: true,
      sortable: false
    },
    {
      data: null,
      title: '',
      delete: true,
      sortable: false
    }
  ],
  formschema: {
    type: 'object',
    title: 'Audio Category',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Category Name',
          required: true
        }
      },
      breakType: {
        title: 'Break Type',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Break Type',
          required: true
        }
      }
    }
  }
};

