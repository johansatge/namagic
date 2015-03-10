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
         * @param $window
         * @param $dom
         */
        this.init = function($window, $dom)
        {
            _initUI.apply(this, [$dom]);
            _initEvents.apply(this, [$window]);
        };

        /**
         * Adds files
         * @param files
         */
        this.addFiles = function(files)
        {
            for (var index in files)
            {
                var row = app.utils.template.render(fileTemplate, [files[index]]);
                $ui.list.append(row);
            }
            $ui.placeholder.toggleClass('js-hidden', $ui.list.children().length > 0);
            // @todo store file with its ID (will be used when applying new operations)
        };

        /**
         * Updates files
         * @param files
         */
        this.updateFiles = function(files)
        {
            app.utils.log('@todo update files in subview');
            // @todo process current files (stored with addFiles) and apply the new filemane for each ID
        };

        /**
         * Inits UI
         * @param $dom
         */
        var _initUI = function($dom)
        {
            $ui.panel = $dom;
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.input = $dom.find('.js-upload');
            $ui.add = $dom.find('.js-files-add');
            $ui.remove = $dom.find('.js-files-remove');
            $ui.list = $dom.find('.js-files-list');
            $ui.dirToggle = $dom.find('.js-toggle-dirs');
            fileTemplate = $dom.find('.js-file-template').html();
        };

        /**
         * Inits events
         * @param $window
         */
        var _initEvents = function($window)
        {
            $window.on('keydown keyup', $.proxy(_onRecordKey, this));
            $ui.placeholder.on('dragenter dragleave mouseenter mouseleave', $.proxy(_onDrag, this));
            $ui.placeholder.on('drop', $.proxy(_onAddFilesFromDrop, this));
            $ui.add.on('click', $.proxy(_onAddFilesFromButton, this));
            $ui.remove.on('click', $.proxy(_onDeleteActiveFiles, this));
            $ui.placeholder.on('click', $.proxy(_onAddFilesFromButton, this));
            $ui.input.on('change', $.proxy(_onAddFilesFromUploader, this));
            $ui.list.on('click', '.js-file', $.proxy(_onFileClick, this));
            $ui.dirToggle.on('change', $.proxy(_onToggleDirectories, this));
        };

        /**
         * Records a hotkey
         * @param evt
         */
        var _onRecordKey = function(evt)
        {
            if (evt.which === 16 || evt.which === 91)
            {
                currentHotkey = evt.type === 'keydown' ? evt.which : false;
            }
            if (evt.which === 8 && evt.type === 'keyup')
            {
                _onDeleteActiveFiles.apply(this);
            }
        };

        /**
         * Drags stuff over the panel
         * @param evt
         */
        var _onDrag = function(evt)
        {
            $ui.panel.toggleClass('js-drag', evt.type === 'dragenter' || evt.type === 'mouseenter');
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onAddFilesFromDrop = function(evt)
        {
            _onDrag({type: 'dragleave'});
            events.emit('add_files', evt.originalEvent.dataTransfer.files);
        };

        /**
         * Selecting files from the hidden upload input
         */
        var _onAddFilesFromUploader = function(evt)
        {
            events.emit('add_files', evt.target.files);
        };

        /**
         * Selecting files from the "Add files..." button
         * @param evt
         */
        var _onAddFilesFromButton = function(evt)
        {
            evt.preventDefault();
            $ui.input.trigger('click');
        };

        /**
         * Toggles directories visibility
         */
        var _onToggleDirectories = function()
        {
            $ui.list.toggleClass('js-directories-visible');
        };

        /**
         * Selects a file in the list
         * @todo check if this works well with a lot of files
         * @param evt
         */
        var _onFileClick = function(evt)
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
            $ui.remove.attr('disabled', $file.hasClass('js-active') ? false : 'disabled');
        };

        /**
         * Handles files deletion
         */
        var _onDeleteActiveFiles = function()
        {
            $ui.list.children().filter('.js-active').remove();
            $lastSelectedFile = false;
            $ui.remove.attr('disabled', 'disabled');
            $ui.placeholder.toggleClass('js-hidden', $ui.list.children().length > 0);
            // @todo remove stored reference with its ID and sends an event to the model
        };

    };

    app.views.main.files = module;

})(window.App, jQuery);