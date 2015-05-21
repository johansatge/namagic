/**
 * Menubar utils
 */
(function(require, m)
{

    'use strict';

    var Menu = require('Menu');
    var MenuItem = require('MenuItem');

    var module = function()
    {
        var mainMenu = new Menu();
        var window = null;
        var appleMenu = new MenuItem('@todo name', '');
        var fileMenu = new MenuItem('File', '');
        var editMenu = new MenuItem('Edit', '');
        var windowMenu = new MenuItem('Window', '');
        var helpMenu = new MenuItem('Help', '');
        mainMenu.appendChild(appleMenu);
        mainMenu.appendChild(fileMenu);
        mainMenu.appendChild(editMenu);
        mainMenu.appendChild(windowMenu);
        mainMenu.appendChild(helpMenu);

        var appleSubmenu = new Menu('@todo name');
        appleSubmenu.appendChild(new MenuItem('About ' + '@todo name', ''));
        appleSubmenu.appendChild(new MenuItemSeparator());
        appleSubmenu.appendChild(new MenuItem('Hide ' + '@todo name', 'h'))
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

        var fileSubmenu = new Menu('File');
        fileSubmenu.appendChild(new MenuItem('New File', 'f'));
        fileSubmenu.appendChild(new MenuItem('Open...', 'o'));
        fileSubmenu.appendChild(new MenuItem('Save', 's'));
        fileSubmenu.appendChild(new MenuItem('Save As...', 'S', 'shift'));
        fileSubmenu.appendChild(new MenuItemSeparator());
        fileSubmenu.appendChild(new MenuItem('Close', 'c', 'cmd'));
        fileMenu.submenu = fileSubmenu;

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
        helpSubmenu.appendChild(new MenuItem('Website', ''));
        helpSubmenu.appendChild(new MenuItem('Online Documentation', ''));
        helpSubmenu.appendChild(new MenuItem('License', ''));
        helpMenu.submenu = helpSubmenu;

        this.setOnWindow = function(win)
        {
            window = win;
            window.menu = mainMenu;
        };

    };

    m.exports = module;

})(require, module);