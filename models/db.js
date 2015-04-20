/* Mongoskin code */
/***********************************************************************/
var settings = require('../settings');
var url = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db;
console.log(url);
var skindb = require('mongoskin').db(url);
module.exports = skindb;