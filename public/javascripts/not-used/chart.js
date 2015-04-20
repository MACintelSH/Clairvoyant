function wrapWith(str, tag){
	result = '<' + tag + '>';
	result += str + '</' + tag + '>';
	return result;
}
function table(id) {
	this.id = id;
	this.progIndex = [];
	this.progDataFetched = false;
	this.addLine = function(infoList) {
		line = '';
		line += wrapWith(infoList.progid, 'td');
		line += wrapWith(infoList.progcode, 'td');
		line += wrapWith(infoList.progname, 'td');
		line += wrapWith('<input type="text" class="span1 teamID" value="0">', 'td');
		line = wrapWith(line, 'tr');
		$('#' + this.id).find('tbody').append(line);
		this.progIndex[infoList.progid] = infoList.progname;
		this.progDataFetched = false;
	};
	this.addLines = function(lines) {
		this.progIndex = [];
		for (i = 0; i < lines.length; i++) {
			this.addLine(lines[i]);
		}
		this.progDataFetched = false;
	}
	this.empty = function() {
		$('#' + this.id).find('tbody').empty();
		this.progDataFetched = false;
	}
	this.getPrognameById = function(id) {
		return this.progIndex[id];
	}
	this.getProgIds = function() {
		result = [];
		for (var key in this.progIndex) {
			result.push(key);
		};
		return result;
	}
	this.getTeams = function() { // return {'teamId1':[progid1, progid2, ...], 'teamId2'...}
		var result = {};
		var $progs = $('#' + this.id).find('tbody').find('tr');
		for (var key=0; key<$progs.length; key++) {
			var id = $($progs[key]).find('td').first().html();
			var teamId = $($progs[key]).find('td').last().find('input').val();
			if (result[teamId] == undefined) {
				result[teamId] = [];
			}
			result[teamId].push(id);
		}

		return result;
	}
}

function cloneObject(obj) {
	var o = obj.constructor === Array ? [] : {};
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === "object" ? cloneObject(obj[i]) : obj[i];
		}
	}
	return o;
}

function hcdate(year, month, day) {
	this.year = year;
	this.month = month;
	this.day = day;
	this.dateObj = Date.UTC(this.year, this.month - 1, this.day);
	this.addOneDay = function() {
		this.dateObj += 24 * 3600 * 1000;
		return this.dateObj;
	}
	this.minusOneDay = function() {
		this.dateObj -= 24 * 3600 * 1000;
		return this.dateObj;
	}
}

function makeSeries(data, chartType, isIgnoreTime) { // Wrap the data for highcharts
	result = []
	function getName(id) {
		var result = proglist.getPrognameById(parseInt(data.ids[i]));
		if (result == undefined)
			result = '聚合 '+id;
		return result;
	}
	for (i = 0; i < data.counts.length; i++) {
		if (isIgnoreTime) {
			result.push({
				type: chartType,
				name: getName(parseInt(data.ids[i])),
				pointInterval: 24 * 3600 * 1000,
				data: data.counts[i]
			});
		}
		else {
			result.push({
				type: chartType,
				name: getName(parseInt(data.ids[i])),
				pointInterval: 24 * 3600 * 1000,
				pointStart: data.startDate.dateObj,
				data: data.counts[i]
			});
		}
	}
	return result;
}
function fetchData(plist) {
	var ids = plist.getProgIds();
	function successCallback(data, textStatus, jqXHR) {
		var isCDF = $('#isCDF').val() == 'NoCDF' ? false : true;
		var chartType = $('#chartType').val();
		var isIgnoreTime = $('#ignoreTime').val() == 'true' ? true : false;
		var isPercentage = $('#isCDF').val() == 'CDF_Percentage' ? true : false;
		plist.origData = data;
		plist.data = genData(plist.origData, isCDF, isIgnoreTime, isPercentage);
		plist.series = makeSeries(plist.data, chartType, isIgnoreTime);
		drawChart(plist.series, isCDF, chartType, '#chartContainer');
		plist.progDataFetched = true;
	}

	if (plist.progDataFetched){
		var isCDF = $('#isCDF').val() == 'NoCDF' ? false : true;
		var chartType = $('#chartType').val();
		var isIgnoreTime = $('#ignoreTime').val() == 'true' ? true : false;
		var isPercentage = $('#isCDF').val() == 'CDF_Percentage' ? true : false;
		plist.data = genData(plist.origData, isCDF, isIgnoreTime, isPercentage);
		plist.series = makeSeries(plist.data, chartType, isIgnoreTime);
		drawChart(plist.series, isCDF, chartType, '#chartContainer');
	}
	else {
		$.ajax({
			type: 'POST',
			url: '/series',
			data: {data:ids},
			success:  successCallback,
			error: function( jqXHR, textStatus, errorThrown ) {
				alert(textStatus + errorThrown);
			}
		})
	}
}

function genData(data, isCDF, isIgnoreTime, isPercentage) { // Will return a json object // Insert zeros into absent days
	days = []
	counts = []
	firstDate = []
	prevDate = []
	currDate = []
	ids = []
	for (j = 0; j < data.length; j++) {
		ids.push(data[j].key);
		items = data[j].records;
		counts.push([]);
		i = 0;
		for (var day in items) {
			splitedDate = day.split('-')
			if (i == 0) {
				tempDate = Date.UTC(parseInt(splitedDate[0]), parseInt(splitedDate[1]) - 1, parseInt(splitedDate[2]));
				if (tempDate < Date.UTC(2012, 11, 01)) { //Acutally it's 2012-12-01
					continue
				}
				firstDate.push(new hcdate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])))
				prevDate.push(new hcdate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])))
				currDate.push(new hcdate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])))
				counts[j].push(items[day]);
				i += 1;
			} else {
				currDate[j] = new hcdate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2]));

				while (currDate[j].dateObj > prevDate[j].addOneDay()) {
					if (isCDF)
						counts[j].push(0 + counts[j][counts[j].length - 1]); //Add to yesterday's total counts
					else
						counts[j].push(0);
					console.log(prevDate.year + '-' + prevDate.month + '-' + prevDate.day);
				}
				if (isCDF)
					counts[j].push(items[day] + counts[j][counts[j].length - 1]); //Add to yesterday's total counts
				else
					counts[j].push(items[day])
			}


			prevDate[j] = currDate[j];
		}
	}

	if (isCDF && isPercentage) {
		for (var j=0; j<counts.length; j++) {
			for (var item in counts[j]) {
				counts[j][item] = counts[j][item]/counts[j][counts[j].length-1];
			}
		}
	}

	// Find the earlist date
	startDate = firstDate[0]
	for (j = 0; j < counts.length; j++) {
		if (firstDate[j].dateObj < startDate.dateObj)
			startDate = firstDate[j]
	}
	// Find the latest date
	endDate = currDate[0]
	for (j = 0; j < counts.length; j++) {
		if (currDate[j].dateObj > endDate.dateObj)
			endDate = currDate[j]
	}

	if (!isIgnoreTime) {
		// Fill the blanks according to start and end date
		for (j = 0; j < counts.length; j++) {
			d = cloneObject(firstDate[j]);
			while (d.dateObj > startDate.dateObj) {
				counts[j].unshift(0);
				d.minusOneDay();
			}
			d = cloneObject(currDate[j]);
			while (d.dateObj < endDate.dateObj) {
				if (isCDF) {
					counts[j].push(counts[j][counts[j].length-1]);
				}
				else {
					counts[j].push(0);
				}
				d.addOneDay();
			}
		}
	}

	// Add aggregrated lines if necessary
	var teams = proglist.getTeams()
	if ( teams != {}) {
		for (var key in teams) { // One team
			var theTeam = teams[key];
			var selectedIndices = [];
			var maxLength = 0;
			ids.push(key);
			counts.push([]);
			for (var idIndex in theTeam) {
				var id = theTeam[idIndex];
				// Find index of the team member
				for (var i=0; i<ids.length; i++) {
					if (ids[i] == id) {
						selectedIndices.push(i);
						if (counts[i].length > maxLength) {
							maxLength = counts[i].length;
						}
						break;
					}
				}
			}
			// Get sums
			for (var j=0; j<maxLength; j++) {
				counts[counts.length-1].push(0); // Push one num into the series
				// Add all the nums from group members
				for (var i=0; i<selectedIndices.length; i++) {
					var currentIndex = selectedIndices[i];	// Team member to be added
					var lastIndex = counts.length-1;		// Last index of the aggregated series
					counts[lastIndex][counts[lastIndex].length-1] += counts[currentIndex][j] == undefined ? 0 : counts[currentIndex][j];
				}
			}		
		}
	}

	return {
		firstDate: firstDate,
		prevDate: prevDate,
		currDate: currDate,
		counts: counts,
		startDate: startDate,
		endDate: endDate,
		ids:ids
	}
}

function drawChart(series, isCDF, chartType, jqSelector) {

	$(jqSelector).highcharts({
		chart: {
			zoomType: 'x',
			spacingRight: 20
		},
		title: {
			text: 'IPTV Program Hit Counts'
		},
		subtitle: {
			text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Drag your finger over the plot to zoom in'
		},
		xAxis: {
			type: 'datetime',
			maxZoom: 14 * 24 * 3600000, // fourteen days
			title: {
				text: null
			}
		},
		yAxis: {
			title: {
				text: 'IPTV Program Hits Count'
			}
		},
		tooltip: {
			shared: true
		},
		legend: {
			enabled: true
		},
		plotOptions: {
			area: {
				// fillColor: {
				//     linearGradient: {
				//         x1: 0,
				//         y1: 0,
				//         x2: 0,
				//         y2: 1
				//     },
				//     stops: [
				//         [0, Highcharts.getOptions().colors[0]],
				//         [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
				//     ]
				// },
				lineWidth: 1,
				marker: {
					enabled: false
				},
				shadow: false,
				states: {
					hover: {
						lineWidth: 1
					}
				},
				threshold: null
			}
		},

		series: series
	});
}

function splitSearchListIn (jqSelector) {
	var str = $(jqSelector).val();
	var result = [];
	var splitedStr = '';
	var symbol = ',';
	if (str.indexOf(symbol) == -1) {
		symbol = ' ';
	}
	splitedStr = str.split(symbol);
	for (var item in splitedStr) {
		result.push($.trim(splitedStr[item]));
	}

	return result;
}

var proglist;

$(document).ready(function(){
	proglist = new table('proglist');
	$('#search').click(function(){
		var ids = splitSearchListIn('#searchBox');
		ids = {data:ids};
		$.ajax({
			type: 'POST',
			url: '/prog',
			data: ids,
			success:  function( data, textStatus, jqXHR ) {
				proglist.empty();
				proglist.addLines(data);
			},
			error: function( jqXHR, textStatus, errorThrown ) {
				alert(textStatus + errorThrown);
			}
		})
	})

	$('#searchBox').bind('keyup', function(event) {
		if (event.keyCode == "13") {
			$('#search').click();
		}
	});
	// Draw chart
	$('#draw').click(function() {
        fetchData(proglist);
    });
});