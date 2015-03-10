/**
 * Editor view
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var window = null;
        var events = new app.node.events.EventEmitter();
        var $ui = {};
        var filesView;
        var operationsView;

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        /**
         * Show main window & inits events
         */
        this.show = function()
        {
            var bootstrap = new app.utils.windowbootstrap('templates/main.html', {
                toolbar: false,
                frame: true,
                width: 900,
                height: 600,
                min_width: 750,
                min_height: 450,
                position: 'mouse',
                resizable: true,
                show: false,
                title: ''
            });
            bootstrap.on('loaded', _onWindowLoaded);
            bootstrap.on('close', _onWindowClose);
            window = bootstrap.initAndShow();
        };

        /**
         * Closes the view
         */
        this.close = function()
        {
            window.close(true);
        };

        /**
         * Adds files
         * @param files
         */
        this.addFiles = function(files)
        {
            filesView.addFiles(files);
        };

        /**
         * Removes files
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            filesView.removeFiles(ids);
        };

        /**
         * Update existing files
         * @param files
         */
        this.updateFiles = function(files)
        {
            filesView.updateFiles(files);
        };

        /**
         * Loads the template when the view is ready
         * @param $window
         * @param $body
         */
        var _onWindowLoaded = function($window, $body)
        {
            _initDOM($window, $body);
            _initSubviews();
            _initEvents();
        };

        /**
         * Inits DOM
         * @param $window
         * @param $body
         */
        var _initDOM = function($window, $body)
        {
            $ui.window = $window;
            $ui.body = $body;
            $ui.filesPanel = $ui.body.find('.js-files-panel');
            $ui.operationsPanel = $ui.body.find('.js-operations-panel');
            $ui.optionsPanel = $ui.body.find('.js-toolbar-panel');
        };

        /**
         * Inits subviews
         */
        var _initSubviews = function()
        {
            filesView = new app.views.main.files();
            filesView.init($ui.window, $ui.filesPanel);
            operationsView = new app.views.main.operations();
            operationsView.init($ui.operationsPanel);
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.window.on('resize', $.proxy(_onWindowResize, this)).trigger('resize');
            operationsView.on('edit_operations', $.proxy(_onEditOperationsFromSubview, this));
            filesView.on('add_files', $.proxy(_onAddFilesFromSubview, this));
            filesView.on('remove_files', $.proxy(_onRemoveFilesFromSubview, this));
        };

        /**
         * Asks to add files from the subview
         * @param raw_files
         */
        var _onAddFilesFromSubview = function(raw_files)
        {
            events.emit('add_files', raw_files);
        };

        /**
         * Asks to delete files from the subview
         * @param raw_ids
         */
        var _onRemoveFilesFromSubview = function(raw_ids)
        {
            events.emit('remove_files', raw_ids);
        };

        /**
         * Ask operations edition from the subview
         * @param data
         */
        var _onEditOperationsFromSubview = function(data)
        {
            events.emit('edit_operations', data);
        };

        /**
         * Tell the controller that the view has been closed
         * @param evt
         */
        var _onWindowClose = function()
        {
            events.emit('close');
        };

        /**
         * Window resize
         */
        var _onWindowResize = function()
        {
            var win_width = $ui.window.width();
            var win_height = $ui.window.height();
            var options_height = $ui.optionsPanel.height();
            $ui.filesPanel.css({
                width: (win_width - $ui.operationsPanel.width()) + 'px',
                height: (win_height - options_height) + 'px'
            });
            $ui.operationsPanel.css({height: (win_height - options_height) + 'px'});
        };

    };

    app.views.main = module;

})(window.App, jQuery);