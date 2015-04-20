
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
//Session support
// var MongoStore = require('connect-mongo')(express);
// var settings = require('./settings');
// Flash support for Express 3.x
// var flash = require('connect-flash');

// var util = require('util');

var app = express();

var routeCtrl = require("./controller/routeCtrl"),
	controllers = require('./controller/controllers');


// all environments
app.set('port', process.env.PORT || 3003);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
// app.use(express.session({
// 	secret: settings.cookieSecret,
// 	store: new MongoStore({
// 		db: settings.db,
// 		host: settings.host
// 	})
// }));
// app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Routes
routeCtrl(app, controllers);

//helpers
// app.locals.user = function(req, res) {
// 	return req.session.user;
// };
// app.locals.error = function(req, res) {
// 	var err = req.flash('error');
// 	if (err.length)
// 		return err;
// 	else
// 		return null;
// };
// app.locals.success = function(req, res) {
// 	var succ = req.flash('success');
// 	if (succ.length) {
// 		return succ;
// 	}
// 	else
// 		return null;
// };
// app.locals.isActivePath = function(req, res, path) {
// 	var result = '';
// 	if (req.path == path)
// 		result = 'active'
// 	return result;
// };

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
