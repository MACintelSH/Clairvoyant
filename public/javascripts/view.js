function View () {
  this.selectedPid = NaN;
  this.progListSize = 6;
  this.progListCurrentPage = 1;
  this.neighborListLength = 5; // Default length of neighbor list
}
View.prototype.SetController = function(ctrl) {
  this.controller = ctrl;
};
View.prototype.VNavChangeFocus = function($obj) {
  $('.hc-nav-left').find('.active').removeClass('active');
  $obj.parent().addClass('active');
};

View.prototype.VChartRefresh = function(data) {
  // Refresh the chart with the given data/options
  // If only one data series, refresh the sidebar with the given data
  var isNeighborNeeded = $('.hc-nav-left > .active > a').html() === 'Neighbors' ? true : false;
  var progname = $('#thumbnailSelectedVideo').find('h4').html();

  var sprd = data.selectedSeries['realStartDate'].split('-');
  var ryear = sprd[0];
  var rmonth = sprd[1] - 1;
  var rday = sprd[2];

  var sppd = data.selectedSeries['predStartDate'].split('-');
  var pyear = sppd[0];
  var pmonth = sppd[1] - 1;
  var pday = sppd[2];

  var series = [];


  series.push({
    type: 'line',
    name: 'Real hits',
    pointInterval: isNeighborNeeded ? 1 : 24 * 3600 * 1000,
    pointStart: isNeighborNeeded ? 1 : Date.UTC(ryear, rmonth, rday),
    data: data.selectedSeries['real']
  });
  series.push({
    type: 'line',
    name: 'Predicted hits',
    pointInterval: isNeighborNeeded ? 1 : 24 * 3600 * 1000,
    pointStart: isNeighborNeeded ? 7 : Date.UTC(pyear, pmonth, pday),
    data: data.selectedSeries['pred']
  });

  if (isNeighborNeeded) {
    for (var i=0; i<this.neighborListLength; i++) {
      series.push({
        type: 'line',
        name: data.neighborData[i]['progname'],
        pointInterval: 1,
        pointStart: 1,
        data: data.neighborData[i]['series']
      });
    }
  }

  var options = {
    chart: {
      zoomType: 'x',
      spacingRight: 20
    },
    title: {
      text: (isNeighborNeeded ? 'Neighbors of ' + progname : progname)
    },
    subtitle: {
      text: document.ontouchstart === undefined ?
        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
    },
    xAxis: {
      type: isNeighborNeeded ? undefined : 'datetime',
      minRange: isNeighborNeeded ? 7 : 7 * 24 * 3600000, // 7 days
      title: {
        text: isNeighborNeeded ? 'Day' : 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Hits'
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
        marker: {
          radius: 2
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null
      }
    },
    series: series
  };

  $('#chart').highcharts(options);
  $('#hc-chart-mask').hide();
  if ( $('#chart').hasClass('hc-blur') ) {
    $('#chart').removeClass("hc-blur");
  }
};
View.prototype._VChartBlur = function() {
  // Set the chart to loading status
  var pos = $('#chart').offset();
  var width = $('#chart').width();
  var height = $('#chart').height();
  $('#hc-chart-mask').css({'left':pos.left, 'top':pos.top, 'width':width+'px', 'height':height+'px'});
  $('#hc-chart-mask').show();
  if ( !$('#chart').hasClass("hc-blur") ) {
    $('#chart').addClass("hc-blur");
  }
};
View.prototype.VNeighborListChangeLength = function($obj) {
  this.neighborListLength = parseInt($obj.val());
};
View.prototype._VNeighborListCreateLine = function (data) {
  // Format of data:
  // num:     number(int)
  // sim:     number(float)
  // pid:      number(int)
  // pname:    str
  // genre:   str
  var _data = {
    'num': String(data.num),
    'sim': String(Math.round(data.sim*1000000)/1000000),
    'pid': String(data.progid),
    'pname': data.progname,
    'genre': data.genre,
    'sim100': String(data.sim*100),
    'bg-class': (data.num)%2===1 ? 'warning' : ''
  };
  var htmlStr = tools.formatString('<tr class="{bg-class}"><td>{num}</td><td><div class="progress hc-progress"><div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="{sim100}" aria-valuemin="0" aria-valuemax="100" style="width: {sim100}%;"></div></div></td><td><span class="badge">{sim}</span></td><td>{pid}</td><td>{pname}</td><td>{genre}</td></tr>\n',_data);
  return htmlStr;
};
View.prototype.VNeighborListCreate = function (arrData) {
  var htmlStr = '';
  for (var i=0; i<this.neighborListLength; i++) {
    // Add order number to the object
    var data = arrData[i];
    arrData[i]['num'] = i+1;

    htmlStr += this._VNeighborListCreateLine(data);
  }
  $('#neighborInfo').find('tbody').removeClass('hc-blur').html(htmlStr);

  $('#neighborInfo').find('.panel-heading').html('Information of Neighbors');

  // Set the 'select' module
  htmlStr = '';
  for (var i=0; i<arrData.length; i++) {
    htmlStr += '<option>' + (i+1) + '</option>\n';
  }
  $('#neighborNum').html(htmlStr);
  $('#neighborNum').val(this.neighborListLength);
  this.controller.CVNeighborListCreateFinished();
};
View.prototype.VNeighborListToggle = function(isShow) {
  this._VChartBlur();
  if (isShow === true) {
    $('#neighborInfo').stop().slideDown( {duration: 600, easing:'easeOutExpo', complete: this.controller.CMFetchDataFinished.bind(this.controller)} );
  }
  else if (isShow === false) {
    $('#neighborInfo').stop().slideUp( {duration: 600, easing:'easeOutExpo', complete: this.controller.CMFetchDataFinished.bind(this.controller)} );
  }
  else {
    console.error("Argument should be true/false.");
  }
};

View.prototype.VSideBarRefresh = function(data) {
  var inputAmount = 0;
  var predAmount = 0;
  var i = 0;
  for (i=0; i<7; i++) {
    inputAmount += data['real'][i];
  }
  for (i=0; i<30; i++) {
    predAmount += data['pred'][i];
  }
  $($('#selectedVideo').find('h1')[0]).html(tools.AddCommaToNum(inputAmount, 0));
  $($('#selectedVideo').find('h1')[1]).html(tools.AddCommaToNum(predAmount, 0));
  $($('#selectedVideo').find('h1')[2]).html(Math.round(predAmount/inputAmount*1000)/1000);

};

View.prototype.VSearchDateChanged = function($obj) {
  var dateStr = $('#queryDate').val();
  
  // Disable the button
  $('#changeQueryDate').button('loading');

  // Enable the blur on #pageNav & # progList
  $('#pageNav').addClass('hc-blur');
  $('#progList').addClass('hc-blur');
  // Add transparent mask on these two divs
  var topLeft = $('#pageNav').offset();
  var width = $('#pageNav').width();
  var height = $('#pageNav').height() + $('#progList').height();
  $('#hc-mask').css({'left': topLeft.left, 'top': topLeft.top, 'width': width + 'px', 'height': height + 'px'});
  $('#hc-mask').stop().fadeIn(200);

  // Ask the controller to fetch data
  this.controller.CVQueryDateChanged.bind(this.controller)(dateStr);
};

View.prototype.VProgListChangeFocus = function($obj) {
  // If already selected, do nothing
  if ($obj.hasClass('hc-thumbnail-active')) {
    return;
  }
  else {
    // Change the focus
    $('#progList').find('.hc-thumbnail-active').removeClass('hc-thumbnail-active');
    $obj.addClass('hc-thumbnail-active');
  }

  // Update the sidebar
  $('#thumbnailSelectedVideo').html($obj.html());

  // Change the selectedVideo
  this.selectedPid = $obj.find('dd').first().html();

  // Set the chart to loading status
  this._VChartBlur();
  
  // Set the neighbor info table to loading status
  $('#neighborInfo').find('tbody').addClass('hc-blur');
  $('#neighborInfo').find('.panel-heading').html('Information of Neighbors (Loading ... )');

  // Fetch the series data and neighbor info
  this.controller.CVSelectedVideoChanged.bind(this.controller)(this.selectedPid);
};
View.prototype._VProgListCreateOne = function(data) {
  var _data = {
    'progid': String(data.progid),
    'progname': data.progname,
    'genre': data.genre,
    'isActive': String(data.progid) === this.selectedPid ? 'hc-thumbnail-active' : ''
  };
  return tools.formatString('<div class="col-md-6"><div class="thumbnail hc-thumbnail {isActive}"><div class="caption"><h4>{progname}</h4><dl><dt>ID</dt><dd>{progid}</dd><dt>Genre</dt><dd>{genre}</dd></dl></div></div></div>\n', _data);
};
View.prototype.VProgListCreate = function(data, pageNum, callback) {
  // Deal with the paremeters
  pageNum = arguments[1] !== undefined ? arguments[1] : 1;

  // Do some preparation
  var totalItem = data.length;
  var totalPage = Math.ceil( totalItem / this.progListSize );
  if ( $('#pageNav').find('.input-group').hasClass('has-error') ) {
    $('#pageNav').find('.input-group').removeClass('has-error');
  }

  // Set view status
  if (pageNum > totalPage || pageNum <= 0) {
    $('#pageNav').find('.input-group').addClass('has-error');
    pageNum = (pageNum - totalPage) > 0 ? totalPage : 1;
    // alert('Page not exists');
    // return;
  }
  this.progListCurrentPage = pageNum;

  // Make html string and refresh the container
  var start = (pageNum - 1) * this.progListSize;
  var end = Math.min(totalItem, this.progListSize * pageNum);
  var htmlStr = '';
  for (var i=start; i<end; i++) {
    htmlStr += this._VProgListCreateOne(data[i]);
  }
  $('#progList').html(htmlStr);

  // Set the #pageNav
  $('.hc-previous').parent().removeClass('disabled');
  $('.hc-next').parent().removeClass('disabled');

  if (this.progListCurrentPage === 1) {
    // No 'Older' on page 1
    if ( !($('.hc-previous').parent().hasClass('disabled')) ) {
      $('.hc-previous').parent().addClass('disabled');
    }
  }
  
  if (totalPage === this.progListCurrentPage) {
    // No 'Newer' on the last page
    if ( !($('.hc-next').parent().hasClass('disabled')) ) {
      $('.hc-next').parent().addClass('disabled');
    }
  }
  $('#totalPage').html('of ' + String(totalPage));
  $('#currentPage').val(String(pageNum));

  // Remove the blur on #pageNav & # progList
  $('#pageNav').removeClass('hc-blur');
  $('#progList').removeClass('hc-blur');
  // Remove the transparent mask on these two divs
  $('#hc-mask').stop().fadeOut(200);
  // Reset the button
  $('#changeQueryDate').button('reset');

  if (callback) {
    callback();
  }
  
};
View.prototype.VProgListNext = function(data, callback) {
  this.VProgListCreate(data, this.progListCurrentPage + 1, callback);
};
View.prototype.VProgListPrev = function(data, callback) {
  this.VProgListCreate(data, this.progListCurrentPage - 1, callback);
};
View.prototype.VProgListJump = function(data, pageNum, callback) {
  this.VProgListCreate(data, pageNum, callback);
};

