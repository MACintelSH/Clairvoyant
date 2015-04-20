module.exports = function (app, routes) {
    app.get('/', routes.index);
    app.get('/home', routes.index);
    app.get('/intro', routes.intro2);
    // app.get('/intro2', routes.intro2);
    app.get('/demo', routes.demo);
    app.get('/about', routes.about);
    app.post('/data', routes.data);
    app.post('/proglist', routes.proglist);
};
