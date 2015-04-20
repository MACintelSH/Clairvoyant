function Tools () {

}

Tools.prototype.formatString = function(str, paras) {
  var reg = /{([^{}]+)}/gm;
  return str.replace(reg, function(match, name) {
    return paras[name];
  });
};
Tools.prototype.GetDateStr = function(dateObj) {
  year = dateObj.getFullYear();
  month = dateObj.getMonth() + 1;
  date = dateObj.getDate();

  return year + '-' + month + '-' + date;
};
Tools.prototype.AddCommaToNum = function(num, reserve) {
  var str = String( Math.round(num * Math.pow(10, reserve)) / Math.pow(10, reserve) );
  var rstr = '';
  var i=0;
  for (i=str.length-1; i>=0; i--) {
    rstr += str[i];
  }
  var rresult = '';
  for (i=0; i<rstr.length; i++) {
    if (i%3 === 0 && i !== 0) {
      rresult += ',';
    }
    rresult += rstr[i];
  }
  var result = '';
  for (i=rresult.length-1; i>=0; i--) {
    result += rresult[i];
  }
  return result;
};

var tools = new Tools();