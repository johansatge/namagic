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
         * Loads the template when the view is ready
         * @param $window
         * @param $body
         */
        var _onWindowLoaded = function($window, $body)
        {
            _initDOM($window, $body);
            _initEvents();
            _initSubviews();
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
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.window.on('resize', $.proxy(_onWindowResize, this)).trigger('resize');
            $ui.window.on('keydown keyup', $.proxy(_onRecordKey, this));
        };

        /**
         * Inits subviews
         */
        var _initSubviews = function()
        {
            filesView = new app.views.main.files();
            filesView.init($ui.filesPanel);
            operationsView = new app.views.main.operations();
            operationsView.init($ui.operationsPanel);
        };

        /**
         * Records a hotkey
         * @param evt
         */
        var _onRecordKey = function(evt)
        {
            if (evt.which === 16 || evt.which === 91)
            {
                filesView.setHotkey(evt.type === 'keydown' ? evt.which : false);
            }
            if (evt.which === 8 && evt.type === 'keyup')
            {
                filesView.deleteActiveFiles();
            }
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