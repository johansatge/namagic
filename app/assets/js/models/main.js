/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        var events = new app.node.events.EventEmitter();

        var currentFiles = [];
        var currentFilesIndexes = {};
        var currentOperations = [];

        var newFiles = [];
        var newFilesCount;

        var pendingFiles = [];
        var pendingFilesCount;

        var defaultdestinationDir;
        var destinationDir;

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
         * Checks if has files
         */
        this.hasFiles = function()
        {
            return currentFiles.length > 0;
        };

        /**
         * Returns the default destination path
         */
        this.getDefaultdestinationDir = function()
        {
            return defaultdestinationDir;
        };

        /**
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            newFiles = files;
            events.emit('progress', 0);
            newFilesCount = newFiles.length;
            _asyncProcessNewFiles.apply(this);
        };

        /**
         * Applies operations on files
         * @param destination_dir
         */
        this.applyOperations = function(destination_dir)
        {
            destinationDir = destination_dir;
            pendingFiles = currentFiles.slice(0);
            pendingFilesCount = currentFiles.length;
            events.emit('progress', 0);
            _asyncApplyOperations.apply(this);
        };

        /**
         * Processes a slice of files when applying operations and recursively calls itself while the queue is not empty
         * Processed files are removed from currentFiles and the UI, others show a message
         */
        var _asyncApplyOperations = function()
        {
            var files = pendingFiles.splice(0, 50);
            var updated_ids = [];
            var statuses = [];
            for (var index = 0; index < files.length; index += 1)
            {
                var file = files[index];
                var source_path = app.utils.string.escapeForCLI(file.dir + '/' + file.name);
                var destination_path = app.utils.string.escapeForCLI(destinationDir + '/' + file.updated_name);
                try
                {
                    app.node.execSync((file.dir !== destinationDir ? 'cp ' : 'mv ') + source_path + ' ' + destination_path);
                    updated_ids.push(file.id);
                    currentFiles.splice(currentFilesIndexes[file.id], 1);
                    delete currentFilesIndexes[file.id];
                }
                catch (error)
                {
                    currentFiles[currentFilesIndexes[file.id]].hasError = true;
                    currentFiles[currentFilesIndexes[file.id]].message = error.message;
                    statuses.push(currentFiles[currentFilesIndexes[file.id]]);
                }
            }
            events.emit('remove_files', updated_ids);
            if (statuses.length > 0)
            {
                events.emit('status_files', statuses);
            }
            events.emit('progress', pendingFiles.length > 0 ? ((pendingFilesCount - pendingFiles.length) * 100) / pendingFilesCount : 100);
            if (pendingFiles.length > 0)
            {
                setTimeout($.proxy(_asyncApplyOperations, this), 0);
            }
            else
            {
                events.emit('idle');
            }
        };

        /**
         * Processes a slice of new files and recursively calls itself while the queue is not empty
         */
        var _asyncProcessNewFiles = function()
        {
            var files = newFiles.splice(0, 50);
            var new_files = [];
            for (var index = 0; index < files.length; index += 1)
            {
                var file = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFilesIndexes[id] === 'undefined')
                {
                    currentFilesIndexes[id] = currentFiles.length;
                    var name = file.name + file.ext;
                    var new_file = {
                        id: id,
                        dir: file.dir,
                        name: name,
                        updated_name: _processOperationsOnFilename.apply(this, [name, file.dir + '/' + name, currentFiles.length]),
                        hasError: false,
                        message: ''
                    };
                    new_files.push(new_file);
                    currentFiles.push(new_file);
                }
            }
            events.emit('add_files', new_files);
            events.emit('progress', newFiles.length > 0 ? ((newFilesCount - newFiles.length) * 100) / newFilesCount : 100);
            if (newFiles.length > 0)
            {
                setTimeout($.proxy(_asyncProcessNewFiles, this), 0);
            }
            else
            {
                if (typeof new_file !== 'undefined')
                {
                    defaultdestinationDir = new_file.dir;
                }
                events.emit('idle');
            }
        };

        /**
         * Removes a list of files
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            for (var index = 0; index < ids.length; index += 1)
            {
                currentFiles.splice(currentFilesIndexes[ids[index]], 1);
                delete currentFilesIndexes[ids[index]];
            }
            events.emit('remove_files', ids);
        };

        /**
         * Applies given operations on the current list of files and returns it
         * @param operations
         */
        this.processOperations = function(operations)
        {
            currentOperations = operations;
            for (var index = 0; index < currentFiles.length; index += 1)
            {
                var file = currentFiles[index];
                currentFiles[index].updated_name = _processOperationsOnFilename.apply(this, [file.name, file.dir + '/' + file.name, index]);
                // @todo here, send and return the entire file object (if errors, conflicts etc, update file.hasError and file.message)
            }
            return currentFiles;
        };

        /**
         * Applies given operations on a filename
         * @param filename
         * @param filepath
         * @param index
         */
        var _processOperationsOnFilename = function(filename, filepath, index)
        {
            // @todo check if filepath exists, return error otherwise
            for (var num in currentOperations)
            {
                var operation = currentOperations[num];
                var name = filename.substring(0, filename.lastIndexOf('.'));
                var ext = filename.substring(filename.lastIndexOf('.'));
                if (operation.applyTo === 'filename')
                {
                    filename = _processOperation.apply(this, [name, operation.selection, operation.actions, index, filepath]) + ext;
                }
                if (operation.applyTo === 'extension')
                {
                    filename = name + _processOperation.apply(this, [ext, operation.selection, operation.actions, index, filepath]);
                }
                if (operation.applyTo === 'both')
                {
                    filename = _processOperation.apply(this, [filename, operation.selection, operation.actions, index, filepath]);
                }
            }
            return filename;
        };

        /**
         * Searches pattern in the given subject and applies action on it
         * @param subject
         * @param selection
         * @param actions
         * @param index
         * @param filepath
         */
        var _processOperation = function(subject, selection, actions, index, filepath)
        {
            if (selection === false || actions.length === 0)
            {
                return subject;
            }
            var selection_callable = app.models.selection[selection.type];
            var patterns = selection_callable(subject, selection.options);
            return _applyPatternsOnSubject.apply(this, [patterns, subject, function(text)
            {
                var updated_text = text;
                for (var index = 0; index < actions.length; index += 1)
                {
                    var action = actions[index];
                    var new_text = app.models.action[action.type](updated_text, index, patterns, action.options, filepath);
                    updated_text = new_text.type === 'remove' ? '' : (new_text.type === 'add' ? updated_text + new_text.text : new_text.text);
                }
                return updated_text;
            }]);
        };

        /**
         * Applies patterns on the given subject by using the required callable
         * @param patterns
         * @param subject
         * @param callable
         */
        var _applyPatternsOnSubject = function(patterns, subject, callable)
        {
            var updated_subject = '';
            var previous_pattern = false;
            var pattern = false;
            for (var index = 0; index < patterns.length; index += 1)
            {
                pattern = patterns[index];
                updated_subject += subject.substring(previous_pattern !== false ? previous_pattern.end : 0, pattern.start);
                updated_subject += callable(subject.substring(pattern.start, pattern.end));
                previous_pattern = pattern;
            }
            return pattern !== false ? updated_subject + subject.substring(previous_pattern.end) : subject;
        };

    };

    app.models.main = module;

})(window.App);