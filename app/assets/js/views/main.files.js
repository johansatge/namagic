/**
 * Files subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();
        var $ui = {};

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
         * Inits the subview
         * @param $dom
         */
        this.init = function($dom)
        {
            _initUI($dom);
            _initEvents();
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.empty = $dom.find('.js-file-empty');
            $ui.input = $dom.find('.js-files-input');
            $ui.add = $dom.find('.js-files-add');
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.empty.on('dragenter mouseenter', $.proxy(_onDragEnter));
            $ui.empty.on('dragleave mouseleave', $.proxy(_onDragLeave));
            $ui.empty.on('drop', $.proxy(_onDropFiles));
            $ui.add.on('click', $.proxy(_onAddFiles));
            $ui.empty.on('click', $.proxy(_onAddFiles));
            $ui.input.on('change', $.proxy(_onSelectFiles));
        };

        /**
         * Drags stuff on the panel
         */
        var _onDragEnter = function()
        {
            $ui.panel.addClass('js-drag');
        };

        /**
         * Drags out from the panel
         */
        var _onDragLeave = function()
        {
            $ui.panel.removeClass('js-drag');
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onDropFiles = function(evt)
        {
            _onDragLeave();
            _parseAndSendFiles(evt.originalEvent.dataTransfer.files);
        };

        /**
         * Selecting files from the input
         */
        var _onSelectFiles = function(evt)
        {
            _parseAndSendFiles(evt.target.files);

        };

        /**
         * Opens the file dialog when clicking on the empty area
         * @param evt
         */
        var _onAddFiles = function(evt)
        {
            evt.preventDefault();
            $ui.input.trigger('click');
        };

        /**
         * Parses a list of files got from a user event
         * @param raw_files
         */
        var _parseAndSendFiles = function(raw_files)
        {
            var files = [];
            for (var index in raw_files)
            {
                app.utils.log(raw_files[index]);
                if (typeof raw_files[index].path !== 'undefined' && raw_files[index].path !== '')
                {
                    files.push(raw_files[index].path);
                }
            }
            // @todo fill view & sends event
            app.utils.log(files);
        };

    };

    app.views.main.files = module;

})(window.App, jQuery);