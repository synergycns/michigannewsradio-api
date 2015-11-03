/**
 * ContentFeedController
 *
 * @description :: Server-side logic for managing feeds of content
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  activity: function(oReq, oRes) {
    ContentFeed.query('SELECT HOUR(createdAt) as iHour, COUNT(id) AS iTotal FROM contentfeed WHERE DATE(createdAt) = DATE(NOW()) GROUP BY HOUR(createdAt)',
      function(oError, aoResults) {
        if(oError) {
          sails.log.error('Error', oError);
          return oRes.negotiate(oError);
        }
        return oRes.ok(aoResults);
      });
  }
};

