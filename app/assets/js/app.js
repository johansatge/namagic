/**
 * App bootstrap
 */
(function(window, $)
{

    'use strict';

    var app = {};
    app.models = {};
    app.views = {};
    app.controllers = {};
    app.utils = {};

    /**
     * Inits
     * @todo support multiple languages
     */
    app.init = function(modules)
    {
        app.node = modules;
        app.devMode = app.node.fs.existsSync('.dev') && app.node.fs.readFileSync('.dev', {encoding: 'utf8'}) === '1';
        app.utils.locale.init('en');
        app.utils.menubar.init();
        app.utils.menubar.on('new', _onNew);
        app.utils.menubar.on('close', _onClose);
        app.utils.menubar.on('about', _onAbout);
        app.utils.menubar.on('quit', _onQuit);
        _onNew();
    };

    /**
     * Request a new window
     */
    var _onNew = function()
    {
        var main = new app.controllers.main();
        main.init();
    };

    /**
     * Tries to close the current window
     */
    var _onClose = function()
    {
        app.utils.windowmanager.closeCurrentWindow();
    };

    /**
     * Request the "About..." page
     */
    var _onAbout = function()
    {
        var about = new app.controllers.about();
        about.init();
    };

    /**
     * Closes the app
     */
    var _onQuit = function()
    {
        app.node.gui.App.closeAllWindows();
    };

    window.App = app;

})(window, jQuery);