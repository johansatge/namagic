/**
 * Files subview
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var events = {};//new app.node.events.EventEmitter();
        var $ui = {};
        var currentHotkey = false;
        var fileTemplate;
        var $lastSelectedFile = false;
        var $files = {};
        var filesCount = 0;

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            //events.on(event, callback);
        };

        /**
         * Inits the subview
         * @param $window
         * @param $dom
         */
        this.init = function($window, $dom)
        {
            _initUI.apply(this, [$window, $dom]);
            $ui.cancelAsync.on('click', $.proxy(_onCancelAsync, this));
            $ui.filesInput.on('change', $.proxy(_onAddFilesFromUploader, this));
            $ui.destinationInput.on('change', $.proxy(_onSelectDestination, this));
            this.lockInterface(false);
        };

        /**
         * Opens the "Choose destination dir" dir
         * @param default_dir
         */
        this.getDestinationDir = function(default_dir)
        {
            $ui.destinationInput.val('').attr('nwworkingdir', default_dir).trigger('click');
        };

        /**
         * Locks the UI by updating buttons and events
         * @param is_locked
         */
        this.lockInterface = function(is_locked)
        {
            $ui.add.attr('disabled', is_locked ? 'disabled' : null);
            $ui.remove.attr('disabled', is_locked || $ui.list.children().filter('.js-active').length === 0 ? 'disabled' : null);
            $ui.list.find('.js-overwrite-button').attr('disabled', is_locked ? 'disabled' : null);
            (is_locked ? $ui.window.off : $ui.window.on).apply($ui.window, ['keydown keyup', $.proxy(_onRecordKey, this)]);
            (is_locked ? $ui.panel.off : $ui.panel.on).apply($ui.panel, ['dragenter', $.proxy(_onDragEnter, this)]);
            (is_locked ? $ui.dragOverlay.off : $ui.dragOverlay.on).apply($ui.dragOverlay, ['dragleave', $.proxy(_onDragLeave, this)]);
            (is_locked ? $ui.panel.off : $ui.panel.on).apply($ui.panel, ['drop', $.proxy(_onAddFilesFromDrop, this)]);
            (is_locked ? $ui.list.off : $ui.list.on).apply($ui.list, ['click', '.js-file', $.proxy(_onFileClick, this)]);
            (is_locked ? $ui.list.off : $ui.list.on).apply($ui.list, ['click', '.js-overwrite-button', $.proxy(_onOverwriteClick, this)]);
            (is_locked ? $ui.add.off : $ui.add.on).apply($ui.add, ['click', $.proxy(_onAddFilesFromButton, this)]);
            (is_locked ? $ui.remove.off : $ui.remove.on).apply($ui.remove, ['click', $.proxy(_onRemoveActiveFiles, this)]);
        };

        /**
         * Removes files from the model
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            for (var index = 0; index < ids.length; index += 1)
            {
                $files[ids[index]].row.parentNode.removeChild($files[ids[index]].row);
                delete $files[ids[index]];
                filesCount -= 1;
            }
            $lastSelectedFile = false;
            $ui.remove.attr('disabled', 'disabled');
            $ui.placeholder.toggle($ui.list.children().length === 0);
            _updateFilesCount.apply(this);
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
                var file_id = file.getID();
                var file_error = file.getError();
                if (add)
                {
                    filesCount += 1;
                    var $row = $(app.utils.template.render(fileTemplate, [file]));
                    $ui.list.append($row);
                    var row = $row.get(0);
                    $files[file_id] = {
                        row: row,
                        updatedName: row.querySelector('.js-new-name'),
                        error: row.querySelector('.js-error'),
                        overwriteButtons: row.querySelector('.js-overwrite')
                    };
                    row.setAttribute('id', file_id);
                    row.querySelector('.js-name').innerHTML = file.getName();
                }
                $files[file_id].updatedName.innerHTML = file.getUpdatedName();
                $files[file_id].error.style.display = file_error !== false ? 'block' : 'none';
                $files[file_id].error.innerHTML = file_error !== false ? file_error.message : '';
                $files[file_id].overwriteButtons.style.display = file_error !== false && file_error.overwrites ? 'block' : 'none';
            }
            _updateFilesCount.apply(this);
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
                $ui.filesCount.hide();
                $ui.progressBarProgress.css({width: 0});
                $ui.progressbar.show();
            }
            if (percentage === 100)
            {
                $ui.add.show();
                $ui.remove.show();
                $ui.filesCount.show();
                $ui.progressbar.hide();
                $ui.placeholder.toggle($ui.list.children().length === 0);
            }
        };

        /**
         * Asks to cancel the current operation
         */
        var _onCancelAsync = function()
        {
            events.emit('cancel');
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
            $ui.cancelAsync = $dom.find('.js-cancel');
            $ui.dragOverlay = $dom.find('.js-drag-overlay');
            $ui.placeholder = $dom.find('.js-placeholder');
            $ui.filesInput = $dom.find('.js-files-input');
            $ui.destinationInput = $dom.find('.js-dest-input');
            $ui.add = $dom.find('.js-files-add');
            $ui.remove = $dom.find('.js-files-remove');
            $ui.list = $dom.find('.js-files-list');
            $ui.progressbar = $dom.find('.js-progressbar');
            $ui.progressBarProgress = $dom.find('.js-progressbar-progress');
            $ui.filesCount = $dom.find('.js-files-count');
            fileTemplate = $dom.find('.js-file-template').html();
            _updateFilesCount.apply(this);
        };

        /**
         * Updates the files count in the toolbar
         */
        var _updateFilesCount = function()
        {
            var active_count = $ui.list.children().filter('.js-active').length;
            var status;
            var locale;
            if (active_count === 0)
            {
                locale = 'main.toolbar.count.' + (filesCount <= 1 ? 'one' : 'many');
                status = app.utils.locale.get(locale).replace('$1', filesCount);
            }
            else
            {
                locale = 'main.toolbar.count.selected_' + (active_count <= 1 ? 'one' : 'many');
                status = app.utils.locale.get(locale).replace('$1', active_count).replace('$2', filesCount);
            }
            $ui.filesCount.html(status);
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
         * Drags files on the panel
         */
        var _onDragEnter = function()
        {
            $ui.dragOverlay.stop().fadeIn(150);
        };

        /**
         * Drags out
         */
        var _onDragLeave = function()
        {
            $ui.dragOverlay.stop().fadeOut(150);
        };

        /**
         * Dropping stuff on the files panel
         * @param evt
         */
        var _onAddFilesFromDrop = function(evt)
        {
            _onDragLeave();
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
         * Clicks on an overwrite action, in a file
         * @param evt
         */
        var _onOverwriteClick = function(evt)
        {
            var $button = $(evt.currentTarget);
            evt.preventDefault();
            evt.stopPropagation();
            var type = $button.data('type');
            var ids = [];
            if ($button.data('target'))
            {
                var $targets = $ui.list.find('.js-overwrite:visible').closest('.js-file');
                $targets.each(function()
                {
                    ids.push($(this).attr('id'));
                });
            }
            else
            {
                ids.push($button.closest('.js-file').attr('id'))
            }
            events.emit('overwrite', type, ids);
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
            _updateFilesCount.apply(this);
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
                ids.push($(this).attr('id'));
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