var mongodb = require('./db');


function AllData() {}
module.exports = AllData;

AllData.get = function(pid, callback) { // pid is number
	var result = {};
	result.selectedSeries = {};
	result.neighborData = [];
	var neighborInfoResult = null;
	var progidToIndex = {};

	var PredSeries = mongodb.collection('PredSeries');
	var RealSeries = mongodb.collection('RealSeries');
	var NeighborInfo = mongodb.collection('NeighborInfo');
	var ProgInfo = mongodb.collection('ProgInfo');

	function queryPredSeries(err, doc) {
		if (err) {
			return callback(err);
		}
		if (!doc) {
			return callback(err, null);
		}

		result.selectedSeries['pred'] = doc[0]['series'].slice(0,30);
		result.selectedSeries['predStartDate'] = doc[0]['startdate'];
		RealSeries.find({
			'progid': pid
		}, {
			'_id': false
		}).toArray(queryRealSeries);
	}

	function queryRealSeries(err, doc) {
		if (err) {
			return callback(err);
		}
		if (!doc) {
			return callback(err, null);
		}
		result.selectedSeries['real'] = doc[0]['series'].slice(0,37);
		NeighborInfo.find({
			'progid': pid
		}, {
			'_id': false
		}).toArray(queryNeighborList);
	}

	function queryNeighborList(err, doc) {
		if (err) {
			return callback(err);
		}
		if (!doc) {
			return callback(err, null);
		}
		neighborInfoResult = doc[0];
		for (var i = 0; i < doc[0]['simList'].length; i++) {
			result.neighborData.push({
				'progid': doc[0]['neighborList'][i],
				'sim': doc[0]['simList'][i]
			});
		}
		ProgInfo.find({
			'progid': {
				'$in': doc[0]['neighborList']
			}
		}, {
			'_id': false
		}).toArray(queryNeighborInfo);
	}

	function queryNeighborInfo(err, doc) {
		if (err) {
			return callback(err);
		}
		if (!doc) {
			return callback(err, null);
		}
		// Deal with neighbor info
		var i = 0;
		for (i = 0; i < result.neighborData.length; i++) {
			progidToIndex[result.neighborData[i]['progid']] = i;
		}
		for (i = 0; i < doc.length; i++) {
			var index = progidToIndex[doc[i]['progid']];
			result.neighborData[index]['progname'] = doc[i]['progname'];
			result.neighborData[index]['genre'] = doc[i]['genre'];
		}
		RealSeries.find({'progid': {'$in':neighborInfoResult['neighborList']}}).toArray(queryNeighborSeries);
	}

	function queryNeighborSeries(err, doc) {
		if (err) {
			return callback(err);
		}
		if (!doc) {
			return callback(err, null);
		}
		for (var i = 0; i < doc.length; i++) {
			var index = progidToIndex[doc[i]['progid']];
			result.neighborData[index]['series'] = doc[i]['series'];
		}
		// Everything is finished, return the result to callback
		callback(err, result);
	}

	// Here is the start of all the quries
	PredSeries.find({
		'progid': pid
	}, {
		'_id': false
	}).toArray(queryPredSeries);

};