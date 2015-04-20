function Controller (view, model) {
  this.isFirstTime = true;
  this.view = view;
  this.model = model;

  this.isNeighborNumBind = false;
}

Controller.prototype.CBindProgListThumbnail = function() {
  $('#progList').find('.hc-thumbnail').click(function() {
    view.VProgListChangeFocus.bind(view)($(this));
  });
};
Controller.prototype.CBindBackToTopClick = function() {
  $('#backToTop').click(function() {
    $('body,html').animate({scrollTop:'0px'},500);
  });
};

Controller.prototype.CInitializeDatePicker = function() {
  // Set the format of the date picker
  $('.form_datetime').datepicker({
    format: 'yyyy-mm-dd',
    todayBtn: true,
    // autoclose: 1,
    todayHighlight: true,
    startView: 'month',
    minView: 'month',
    autoclose: true,
    startDate: '2013-04-08',
    endDate: '2013-04-26'
  });
  // Set the default date to today
  // var now = new Date();
  // $('#queryDate').val(tools.GetDateStr(now));
  $('#queryDate').val('2013-04-08');
};
Controller.prototype.CInitializePage = function() {
  this.CInitializeDatePicker();
  this.CBindBackToTopClick();
  // Keep compatibility on firefox
  $('#changeQueryDate').button('reset');
};
Controller.prototype.CVNeighborListCreateFinished = function () {
  var evtFunc = this.CVNeighborNumChanged.bind(this);
  if (!this.isNeighborNumBind) {
    this.isNeighborNumBind = true;
    $('#neighborNum').change(evtFunc);
  }
};
Controller.prototype.CVNeighborNumChanged = function() {
  this.view.VNeighborListChangeLength.bind(this.view)($('#neighborNum'));
  this.CMFetchDataFinished();
};
Controller.prototype.CVSelectedVideoChanged = function(strPid) {
  // Fetch data
  this.model.MFetchDataBy.bind(this.model)(strPid);
};
Controller.prototype.CVQueryDateChanged = function(dateStr) {
  this.model.MFetchProgListBy.bind(this.model)(dateStr);
};
// Controller.prototype.CMFetchNeighborInfoFinished = function(data) {
  
// };
Controller.prototype.CMFetchProgListFinished = function(data) {
  this.view.VProgListCreate.bind(this.view)(data,1,this.CBindProgListThumbnail.bind(this.view));

  if (this.isFirstTime) {
    this.view.VProgListChangeFocus.bind(this.view)( $('#progList').find('.hc-thumbnail').first() );
    this.isFirstTime = false;
  }
};
Controller.prototype.CMFetchDataFinished = function() {
  this.view.VChartRefresh.bind(this.view)(this.model);
  this.view.VSideBarRefresh.bind(this.view)(this.model.selectedSeries);
  this.view.VNeighborListCreate.bind(this.view)(this.model.neighborData);
};

var view = new View();
var model = new Model();
var controller = new Controller(view, model);
view.SetController.bind(view)(controller);
model.SetController.bind(model)(controller);


$(document).ready(function() {
  // Navbar click events
  $('.hc-nav-left').find('a').click(function() {
    if ($(this).html() === 'Neighbors') {
      view.VNeighborListToggle.bind(view)(true);
    }
    else {
      view.VNeighborListToggle.bind(view)(false);
    }
    view.VNavChangeFocus.bind(view)($(this));
  });

  // Neighbor list length control
  // $(document).on('change', '#neighborNum', function() {
  //   view.VNeighborListChangeLength.bind(view)($('#neighborNum'));
  //   controller.CMFetchDataFinished.bind(controller);
  // });
  // $('#neighborNum').change(function(){
  //   view.VNeighborListChangeLength.bind(view)($(this));
  //   controller.CMFetchDataFinished.bind(controller);
  // });

  // Set the onClick event fuction of '#changeQueryDate' button
  $('#changeQueryDate').click(function() {
    view.VSearchDateChanged.bind(view)($(this));
  });

  // #pageNav events
  $('.hc-previous').click(function() {
    view.VProgListPrev(model.progListData, controller.CBindProgListThumbnail.bind(controller));
  });
  $('.hc-next').click(function() {
    view.VProgListNext(model.progListData, controller.CBindProgListThumbnail.bind(controller));
  });
  $('#jumpToPage').click(function() {
    var pageNum = parseInt( $('#currentPage').val() );
    view.VProgListJump(model.progListData, pageNum, controller.CBindProgListThumbnail.bind(controller));
  });
  // Also support 'enter' jump
  $('#currentPage').keydown(function(e) {
    if (e.keyCode == 13) {
      $("#jumpToPage").click();
    }
  });

  // Initialization
  // model.MFetchProgListBy.bind(model)('2013-04-01');
  controller.CInitializePage.bind(controller)();
  $('#changeQueryDate').click();
});
