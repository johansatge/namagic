/**
 * Menubar utils
 */
(function(app, $)
{

    'use strict';

    var module = {};
    var menubar;
    var events = new app.node.events.EventEmitter();

    /**
     * Attaches an event
     * @param event
     * @param callback
     */
    module.on = function(event, callback)
    {
        events.on(event, callback);
    };

    /**
     * Inits the main menubar
     */
    module.init = function()
    {
        menubar = new app.node.gui.Menu({type: 'menubar'});

        var app_menu = new app.node.gui.Menu();
        app_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.about'), click: function()
            {
                events.emit('about');
            }
        }));
        app_menu.append(new app.node.gui.MenuItem({type: 'separator'}));
        app_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.quit'),
            key: 'q',
            modifiers: 'cmd',
            click: function()
            {
                events.emit('quit');
            }
        }));

        var file_menu = new app.node.gui.Menu();
        file_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.new'),
            key: 'n',
            modifiers: 'cmd',
            click: function()
            {
                events.emit('new');
            }
        }));
        file_menu.append(new app.node.gui.MenuItem({type: 'separator'}));
        file_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.close'),
            key: 'w',
            modifiers: 'cmd',
            click: function()
            {
                events.emit('close');
            }
        }));

        menubar.append(new app.node.gui.MenuItem({label: app.utils.locale.get('manifest.name'), submenu: app_menu}));
        menubar.append(new app.node.gui.MenuItem({label: app.utils.locale.get('menu.file'), submenu: file_menu}));
    };

    /**
     * Gets the menubar
     * @returns object
     */
    module.get = function()
    {
        return menubar;
    };

    app.utils.menubar = module;

})(window.App, jQuery);