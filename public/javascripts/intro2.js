var videoObj = $('#hc-intro-video')[0];

// Switch start point
$('.hc-guide-only-btn').click(function(){
  videoObj.currentTime = 69;
  videoObj.play();
  $('#hc-video-guide').hide();
  $('#hc-video-full').show();
});
$('.hc-full-video-btn').click(function(){
  videoObj.currentTime = 0;
  videoObj.play();
  $('#hc-video-guide').show();
  $('#hc-video-full').hide();
});

// Switch video quality
var curQuality = $('.hc-quality').find('.active').first().html();
$('.hc-quality').click(function(){
  // If a new quality has been chosen, switch the quality, and continue at the switching point.
  if ( $(this).hasClass('active') !== true ) {
    $('.hc-quality.active').removeClass('active');
    qualityName = 'hc-' + $(this).html();
    $('.'+qualityName).addClass('active');
    var pauseTime = videoObj.currentTime;
    var origSrc = videoObj.src;
    var newSrc = origSrc.slice( 0, origSrc.lastIndexOf('/')+1 ) + 'intro_' + $(this).html() + '.mp4';
    videoObj.src = newSrc;
    videoObj.currentTime = pauseTime;
    videoObj.play();
  }
});