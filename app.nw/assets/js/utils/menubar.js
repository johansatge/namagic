/**
 * Menubar utils
 */
(function(app)
{

    'use strict';

    var module = {};
    var menubar;
    var events;

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
        events = new app.node.events.EventEmitter();
        menubar = new app.node.gui.Menu({type: 'menubar'});
        menubar.createMacBuiltin(app.utils.locale.get('manifest.name'));

        // Removes default "about" item
        menubar.items[0].submenu.removeAt(0);
        menubar.items[0].submenu.insert(new app.node.gui.MenuItem({
            label: app.utils.locale.get('manifest.name') + ' ' + app.utils.locale.get('manifest.version'),
            enabled: false
        }), 0);

        // Removes "cmd-z" items
        menubar.items[1].submenu.removeAt(0);
        menubar.items[1].submenu.removeAt(0);
        menubar.items[1].submenu.removeAt(0);

        // Adds "file" item
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
        menubar.insert(new app.node.gui.MenuItem({label: app.utils.locale.get('menu.file'), submenu: file_menu}), 1);

        // Adds "help" item
        var help_menu = new app.node.gui.Menu();
        help_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.help.help'),
            key: '?',
            modifiers: 'cmd',
            click: function()
            {
                events.emit('help');
            }
        }));
        help_menu.append(new app.node.gui.MenuItem({type: 'separator'}));
        help_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.help.website'),
            click: function()
            {
                events.emit('website');
            }
        }));
        help_menu.append(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.help.bug_report'),
            click: function()
            {
                events.emit('bug_report');
            }
        }));
        menubar.insert(new app.node.gui.MenuItem({
            label: app.utils.locale.get('menu.help.title'),
            submenu: help_menu
        }), 4);
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

})(window.App);