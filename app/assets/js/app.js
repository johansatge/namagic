/**
 * App bootstrap
 */
(function(window, $, require)
{

    'use strict';

    var app = {};
    app.node = {};
    app.node.gui = require('nw.gui');
    app.node.fs = require('fs');
    app.node.events = require('events');
    app.node.crypto = require('crypto');
    app.node.util = require('util');
    app.views = {};
    app.controllers = {};
    app.utils = {};
    app.devMode = app.node.fs.existsSync('.dev') && app.node.fs.readFileSync('.dev', {encoding: 'utf8'}) === '1';
    app.locale = eval('(' + app.node.fs.readFileSync('locale/en.json') + ')');
    app.menubar = false;

    /**
     * Inits
     */
    app.init = function()
    {
        app.menubar = new app.node.gui.Menu({type: 'menubar'});

        var app_menu = new app.node.gui.Menu();
        app_menu.append(new app.node.gui.MenuItem({label: app.locale.menu_about, click: $.proxy(_onAbout, this)}));
        app_menu.append(new app.node.gui.MenuItem({type: 'separator'}));
        app_menu.append(new app.node.gui.MenuItem({label: app.locale.menu_quit, key: 'q', modifiers: 'cmd', click: $.proxy(_onQuit, this)}));

        var file_menu = new app.node.gui.Menu();
        file_menu.append(new app.node.gui.MenuItem({label: app.locale.menu_new, key: 'n', modifiers: 'cmd', click: $.proxy(_onNewEditor, this)}));
        file_menu.append(new app.node.gui.MenuItem({type: 'separator'}));
        file_menu.append(new app.node.gui.MenuItem({label: app.locale.menu_close, key: 'w', modifiers: 'cmd', click: $.proxy(_onClose, this)}));

        app.menubar.append(new app.node.gui.MenuItem({label: app.node.gui.App.manifest.name, submenu: app_menu}));
        app.menubar.append(new app.node.gui.MenuItem({label: app.locale.menu_file, submenu: file_menu}));

        _onNewEditor();
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
     * Tries to close the current window
     */
    var _onClose = function()
    {
        app.utils.window.closeCurrentWindow();
    };

    /**
     * Request a new editor
     */
    var _onNewEditor = function()
    {
        var editor = new app.controllers.editor();
        editor.init();
    };

    /**
     * Closes the app
     */
    var _onQuit = function()
    {
        app.node.gui.App.closeAllWindows();
    };

    window.App = app;

})(window, jQuery, require);