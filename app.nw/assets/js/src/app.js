/**
 * App bootstrap
 */
(function(window, navigator)
{

    'use strict';

    var app = {};
    app.models = {};
    app.views = {};
    app.controllers = {};
    app.utils = {};

    /**
     * Inits
     */
    app.init = function(modules)
    {
        app.node = modules;
        app.devMode = app.node.fs.existsSync('.dev') && app.node.fs.readFileSync('.dev', {encoding: 'utf8'}) === '1';
        app.utils.locale.init('fr');//typeof navigator.language !== 'undefined' ? navigator.language : '');
        app.utils.menubar.init();
        app.utils.menubar.on('new', _onNew);
        app.utils.menubar.on('website', _onWebsite);
        app.utils.menubar.on('help', _onHelp);
        app.utils.menubar.on('bug_report', _onBugReport);
        app.utils.menubar.on('quit', _onQuit);
        _onNew();
    };

    /**
     * Opens the dates help
     */
    app.openDateFormatsHelp = function()
    {
        var bootstrap = new app.utils.windowbootstrap('templates/dateformats.html', {
            toolbar: false,
            frame: true,
            width: 500,
            height: 650,
            min_width: 300,
            min_height: 300,
            position: 'mouse',
            resizable: true,
            show: false,
            title: app.utils.locale.get('dateformats.title')
        });
        var win = bootstrap.initAndShow();
        bootstrap.on('close', function()
        {
            win.close(true);
        })
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
     * Requests website
     */
    var _onWebsite = function()
    {
        app.node.gui.Shell.openExternal(app.utils.locale.get('manifest.urls.website'));
    };

    /**
     * Requests help
     */
    var _onHelp = function()
    {
        app.node.gui.Shell.openExternal(app.utils.locale.get('manifest.urls.help'));
    };

    /**
     * Requests bug reporter
     */
    var _onBugReport = function()
    {
        app.node.gui.Shell.openExternal(app.utils.locale.get('manifest.urls.bug_report'));
    };

    /**
     * Closes the app
     */
    var _onQuit = function()
    {
        app.node.gui.App.closeAllWindows();
    };

    window.App = app;

})(window, navigator);
