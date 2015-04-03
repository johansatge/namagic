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
        var $files = {};

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
            _initUI.apply(this, [$window, $dom]);
            this.lockInterface(false);
        };

        /**
         * Opens the "Choose destination dir" dir
         * @param default_dir
         */
        this.getDestinationDir = function(default_dir)
        {
            $ui.destinationInput.attr('nwworkingdir', default_dir).trigger('click');
        };

        /**
         * Locks the UI by updating buttons and events
         * @param is_locked
         */
        this.lockInterface = function(is_locked)
        {
            $ui.add.attr('disabled', is_locked ? 'disabled' : null);
            $ui.remove.attr('disabled', is_locked || $ui.list.children().filter('.js-active').length === 0 ? 'disabled' : null);
            (is_locked ? $ui.window.off : $ui.window.on).apply($ui.window, ['keydown keyup', $.proxy(_onRecordKey, this)]);
            (is_locked ? $ui.panel.off : $ui.panel.on).apply($ui.panel, ['dragenter dragleave', $.proxy(_onPlaceholderDrag, this)]);
            (is_locked ? $ui.panel.off : $ui.panel.on).apply($ui.panel, ['drop', $.proxy(_onAddFilesFromDrop, this)]);
            (is_locked ? $ui.list.off : $ui.list.on).apply($ui.list, ['click', '.js-file', $.proxy(_onFileClick, this)]);
            (is_locked ? $ui.add.off : $ui.add.on).apply($ui.add, ['click', $.proxy(_onAddFilesFromButton, this)]);
            (is_locked ? $ui.remove.off : $ui.remove.on).apply($ui.remove, ['click', $.proxy(_onRemoveActiveFiles, this)]);
            (is_locked ? $ui.filesInput.off : $ui.filesInput.on).apply($ui.filesInput, ['change', $.proxy(_onAddFilesFromUploader, this)]);
            (is_locked ? $ui.destinationInput.off : $ui.destinationInput.on).apply($ui.destinationInput, ['change', $.proxy(_onSelectDestination, this)]);
        };

        /**
         * Removes files from the model
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            for (var index = 0; index < ids.length; index += 1)
            {
                $files[ids[index]].$row.remove();
                delete $files[ids[index]];
            }
            $lastSelectedFile = false;
            $ui.remove.attr('disabled', 'disabled');
            $ui.placeholder.toggle($ui.list.children().length === 0);
        };

        /**
         * Updates or add files
         * @param files
         * @param add
         */
        this.updateFiles = function(files, add)
        {
            for (var index = 0; index < files.length; index += 1)
            {
                var file = files[index];
                if (add)
                {
                    $files[file.id] = {$row: $(app.utils.template.render(fileTemplate, [file]))};
                    $files[file.id].$updatedName = $files[file.id].$row.find('.js-new-name');
                    $files[file.id].$status = $files[file.id].$row.find('.js-status-message');
                    $ui.list.append($files[file.id].$row);
                }
                $files[file.id].$updatedName.text(file.updatedName);
                $files[file.id].$row.toggleClass('js-error', file.hasError());
                $files[file.id].$status.html(file.message);
            }
        };

        /**
         * Updates the progress of an operation
         * @param percentage
         */
        this.setProgress = function(percentage)
        {
            $ui.progressBarProgress.css({width: percentage + '%'});
            if (percentage === 0)
            {
                $ui.add.hide();
                $ui.remove.hide();
                $ui.progressBarProgress.css({width: 0});
                $ui.progressbar.show();
            }
            if (percentage === 100)
            {
                $ui.add.show();
                $ui.remove.show();
                $ui.progressbar.hide();
                $ui.placeholder.toggle($ui.list.children().length === 0);
            }
        };

        /**
         * Inits UI
         * @param $window
         * @param $dom
         */
        var _initUI = function($window, $dom)
        {
            $ui.window = $window;
            $ui.panel = $dom;
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.filesInput = $dom.find('.js-files-input');
            $ui.destinationInput = $dom.find('.js-dest-input');
            $ui.add = $dom.find('.js-files-add');
            $ui.remove = $dom.find('.js-files-remove');
            $ui.list = $dom.find('.js-files-list');
            $ui.progressbar = $dom.find('.js-progressbar');
            $ui.progressBarProgress = $dom.find('.js-progressbar-progress');
            fileTemplate = $dom.find('.js-file-template').html();
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
                _onRemoveActiveFiles.apply(this);
            }
        };

        /**
         * Drags stuff over the panel
         * @param evt
         */
        var _onPlaceholderDrag = function(evt)
        {
            $ui.panel.toggleClass('js-drag', evt.type === 'dragenter');
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onAddFilesFromDrop = function(evt)
        {
            _onPlaceholderDrag({type: 'dragleave'});
            events.emit('add_files', _cleanSelectedFiles.apply(this, [evt.originalEvent.dataTransfer.files]));
        };

        /**
         * Selecting files from the hidden upload input
         */
        var _onAddFilesFromUploader = function(evt)
        {
            events.emit('add_files', _cleanSelectedFiles.apply(this, [evt.target.files]));
        };

        /**
         * Selecting files from the "Add files..." button
         * @param evt
         */
        var _onAddFilesFromButton = function(evt)
        {
            evt.preventDefault();
            $ui.filesInput.trigger('click');
        };

        /**
         * Selects the destination dir from the file dialog
         * @param evt
         */
        var _onSelectDestination = function(evt)
        {
            evt.preventDefault();
            var dir = evt.target.files.length > 0 ? evt.target.files[0].path : false;
            events.emit('set_destination', dir);
        };

        /**
         * Selects a file in the list
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
                $file.toggleClass('js-active');
                if (currentHotkey !== 91)
                {
                    $file.siblings().removeClass('js-active');
                }
            }
            $lastSelectedFile = $file.hasClass('js-active') ? $file : false;
            $ui.remove.attr('disabled', $file.hasClass('js-active') ? false : 'disabled');
        };

        /**
         * Handles files deletion
         */
        var _onRemoveActiveFiles = function()
        {
            var $items = $ui.list.children().filter('.js-active');
            var ids = [];
            $items.each(function()
            {
                var id = $(this).data('id');
                ids.push(id);
            });
            events.emit('remove_files', ids);
        };

        /**
         * Cleans files selected in the view
         * @param raw_files
         */
        var _cleanSelectedFiles = function(raw_files)
        {
            var files = [];
            for (var index in raw_files)
            {
                if (typeof raw_files[index].path !== 'undefined' && raw_files[index].path !== '')
                {
                    files.push(raw_files[index].path);
                }
            }
            return files;
        }

    };

    app.views.files = module;

})(window.App, jQuery);