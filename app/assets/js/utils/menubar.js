/**
 * Menubar utils
 */
(function(require, m)
{

    'use strict';

    var Menu = require('Menu');
    var MenuItem = require('MenuItem');
    var System = require('System');

    var module = function()
    {
        var mainMenu = new Menu();
        var window = null;
        var appleMenu = new MenuItem('@todo name', '');
        var editMenu = new MenuItem('Edit', '');
        var windowMenu = new MenuItem('Window', '');
        var helpMenu = new MenuItem('Help', '');
        mainMenu.appendChild(appleMenu);
        mainMenu.appendChild(editMenu);
        mainMenu.appendChild(windowMenu);
        mainMenu.appendChild(helpMenu);

        var appleSubmenu = new Menu(application.name);
        appleSubmenu.appendChild(new MenuItem('Hide ' + application.name, 'h'))
            .addEventListener('click', function()
            {
                application.visible = false;
            });
        appleSubmenu.appendChild(new MenuItem('Hide Others', ''))
            .addEventListener('click', function()
            {
                application.hideAllOtherApplications();
            });
        appleSubmenu.appendChild(new MenuItem('Show All', ''))
            .addEventListener('click', function()
            {
                application.unhideAllOtherApplications();
            });
        appleSubmenu.appendChild(new MenuItemSeparator());
        appleSubmenu.appendChild(new MenuItem('Quit ' + '@todo name', 'q'))
            .addEventListener('click', function()
            {
                process.exit(0);
            });
        appleMenu.submenu = appleSubmenu;

        var editSubmenu = new Menu('Edit');
        var undo = new MenuItem('Undo', 'u');
        undo.addEventListener('click', function()
        {
            application.undo();
        });
        editSubmenu.appendChild(undo);
        editSubmenu.appendChild(new MenuItem('Redo', 'r'))
            .addEventListener('click', function()
            {
                application.redo();
            });
        editSubmenu.appendChild(new MenuItemSeparator());
        editSubmenu.appendChild(new MenuItem('Copy', 'c'))
            .addEventListener('click', function()
            {
                application.copy();
            });
        editSubmenu.appendChild(new MenuItem('Cut', 'x'))
            .addEventListener('click', function()
            {
                application.cut();
            });
        editSubmenu.appendChild(new MenuItem('Paste', 'p'))
            .addEventListener('click', function()
            {
                application.paste();
            });
        editMenu.submenu = editSubmenu;

        var windowSubmenu = new Menu('Window');
        windowSubmenu.appendChild(new MenuItem('Minimize', 'm'))
            .addEventListener('click', function()
            {
                window.state = "minimized";
            });
        windowSubmenu.appendChild(new MenuItem('Zoom', ''))
            .addEventListener('click', function()
            {
                window.state = "maximized";
            });
        windowSubmenu.appendChild(new MenuItemSeparator());
        windowSubmenu.appendChild(new MenuItem('Bring All to Front', ''))
            .addEventListener('click', function()
            {
                window.bringToFront();
            });
        windowSubmenu.appendChild(new MenuItemSeparator());
        windowMenu.submenu = windowSubmenu;

        var helpSubmenu = new Menu('Help');
        helpSubmenu.appendChild(new MenuItem('Online help', ''))
            .addEventListener('click', function()
            {
                System.openURL('https://github.com/namagicapp/support');
            });
        helpSubmenu.appendChild(new MenuItemSeparator());
        helpSubmenu.appendChild(new MenuItem('Website', ''))
            .addEventListener('click', function()
            {
                System.openURL('http://www.namagicapp.com');
            });
        helpSubmenu.appendChild(new MenuItem('Report a bug or request a feature', ''))
            .addEventListener('click', function()
            {
                System.openURL('https://github.com/namagicapp/support/issues');
            });
        helpMenu.submenu = helpSubmenu;

        /**
         * Associates the menubar to a window
         * @param win
         */
        this.setOnWindow = function(win)
        {
            window = win;
            window.menu = mainMenu;
        };
    };

    m.exports = module;

})(require, module);