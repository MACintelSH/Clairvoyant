var mongodb = require('./db');


function ProgList() {}
module.exports = ProgList;

ProgList.get = function(strDate, callback) {
	var progids = [];

	mongodb.collection('PredSeries', function(err, collection) {
		if (err) {
			return callback(err);
		}
		collection.find({
			'startdate': strDate
		}, {
			'_id': 0,
			'progid': true
		}).toArray(function(err, doc) {
			// doc is the list of progid
			if (doc) {
				progids = [];
				for (var i=0; i<doc.length; i++) {
					progids.push(doc[i]['progid']);
				}
				mongodb.collection('ProgInfo', function(err, collection) {
					if (err) {
						return callback(err);
					}
					collection.find({
						'progid': {'$in':progids}
					}, {'_id':0, 'progname':true, 'progid':true, 'genre':true, 'startdate':true}).toArray(function(err, doc) {
						if (!doc) {
							return callback(err);
						}
						// doc is the prog info of the progs in progids
						callback(err, doc);
					});
				});
			} else {
				callback(err, null);
			}
		});
	});
};