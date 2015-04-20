
/*
 * GET home page.
 */
module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index', {
			title: 'ChatChart 话图'
		});
	})
};
module.exports = function(app) {
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: 'ChatChart 话图'
		});
	})
};

// exports.user = function(req, res) {

// };

// exports.post = function(req, res) {};
// exports.reg = function(req, res) {};
// exports.doReg = function(req, res) {};
// exports.login = function(req, res) {};
// exports.doLogin = function(req, res) {};
// exports.logout = function(req, res) {};