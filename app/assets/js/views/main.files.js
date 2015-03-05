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
        var currentHotkey = false;
        var fileTemplate;
        var $lastSelectedFile = false;

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
         * Sets the current hotkey (used for files selection)
         * @param hotkey
         */
        this.setHotkey = function(hotkey)
        {
            currentHotkey = hotkey;
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.placeholder = $dom.find('.js-file-placeholder');
            $ui.input = $dom.find('.js-files-input');
            $ui.add = $dom.find('.js-files-add');
            $ui.list = $dom.find('.js-files-list');
            fileTemplate = $dom.find('.js-file-template').html();
        };

        /**
         * Inits events
         */
        var _initEvents = function()
        {
            $ui.panel.on('keypress', $.proxy(_onKeyPress, this));
            $ui.placeholder.on('dragenter mouseenter', $.proxy(_onDragEnter, this));
            $ui.placeholder.on('dragleave mouseleave', $.proxy(_onDragLeave, this));
            $ui.placeholder.on('drop', $.proxy(_onDropFiles, this));
            $ui.add.on('click', $.proxy(_onAddNewsFiles, this));
            $ui.placeholder.on('click', $.proxy(_onAddNewsFiles, this));
            $ui.input.on('change', $.proxy(_onSelectNewFiles, this));
            $ui.list.on('click', '.js-file', $.proxy(_onSelectFile, this));
        };

        var _onKeyPress = function(evt)
        {
            console.log(evt.keyCode);
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
        var _onSelectNewFiles = function(evt)
        {
            _parseAndSendFiles(evt.target.files);

        };

        /**
         * Opens the file dialog when clicking on the empty area
         * @param evt
         */
        var _onAddNewsFiles = function(evt)
        {
            evt.preventDefault();
            $ui.input.trigger('click');
        };

        /**
         * Selects a file in the list
         * @todo check if this works well with a lot of files
         * @param evt
         */
        var _onSelectFile = function(evt)
        {
            var $file = $(evt.currentTarget);
            if (currentHotkey === 16)
            {
                if ($lastSelectedFile === false)
                {
                    $file.toggleClass('js-active');
                }
                else
                {
                    var start_index = Math.min($lastSelectedFile.index(), $file.index());
                    var end_index = Math.max($lastSelectedFile.index(), $file.index());
                    $ui.list.children().slice(start_index, end_index + 1).addClass('js-active');
                }
            }
            else
            {
                if (currentHotkey === 91)
                {
                    $file.toggleClass('js-active');
                }
                else
                {
                    $file.toggleClass('js-active');
                    $file.siblings().removeClass('js-active');
                }
            }
            $lastSelectedFile = $file.hasClass('js-active') ? $file : false;
        };

        /**
         * Parses a list of files got from a user event
         * @param raw_files
         */
        var _parseAndSendFiles = function(raw_files)
        {
            for (var index in raw_files)
            {
                if (typeof raw_files[index].path !== 'undefined' && raw_files[index].path !== '')
                {
                    var data = {
                        dir: raw_files[index].path.substring(0, raw_files[index].path.length - raw_files[index].name.length),
                        name: raw_files[index].name
                    };
                    var row = app.utils.template.render(fileTemplate, [data]);
                    $ui.list.append(row);
                }
            }

            $ui.placeholder.toggleClass('js-hidden', $ui.list.children().length > 0);

            // @todo sends event
        };

    };

    app.views.main.files = module;

})(window.App, jQuery);