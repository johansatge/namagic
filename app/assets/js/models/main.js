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
            var processed_ids = [];
            var updated_files = [];
            for (var index = 0; index < files.length; index += 1)
            {
                var file = files[index];
                if (file.hasError())
                {
                    continue;
                }
                var source_path = app.utils.string.escapeForCLI(file.getDirectory() + '/' + file.getName());
                var destination_path = app.utils.string.escapeForCLI(destinationDir + '/' + file.updatedName);
                try
                {
                    app.node.execSync((file.getDirectory() !== destinationDir ? 'cp ' : 'mv ') + source_path + ' ' + destination_path);
                    processed_ids.push(file.id);
                    currentFiles.splice(currentFilesIndexes[file.id], 1);
                    delete currentFilesIndexes[file.id];
                }
                catch (error)
                {
                    currentFiles[currentFilesIndexes[file.id]].setError(true, error.message);
                    updated_files.push(currentFiles[currentFilesIndexes[file.id]]);
                }
            }
            events.emit('remove_files', processed_ids);
            if (updated_files.length > 0)
            {
                events.emit('update_files', updated_files);
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
                var fileinfo = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFilesIndexes[id] === 'undefined')
                {
                    currentFilesIndexes[id] = currentFiles.length;
                    var new_file = new app.models.file(id, fileinfo.dir, fileinfo.name + fileinfo.ext);
                    _processOperationsOnFile.apply(this, [new_file, currentFiles.length]);
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
                    defaultdestinationDir = new_file.getDirectory();
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
                _processOperationsOnFile.apply(this, [file, index]);
            }

            // @todo for each file without error, store its filename;
            // the next ones check that their name does not exist, otherwise set an error in the object

            events.emit('update_files', currentFiles);
        };

        /**
         * Applies given operations on a file
         * @param file
         * @param index
         */
        var _processOperationsOnFile = function(file, index)
        {
            file.updatedName = file.getName();
            var filepath = file.getDirectory() + '/' + file.getName();
            for (var num = 0; num < currentOperations.length; num += 1)
            {
                _processOperationOnFile.apply(this, [file, currentOperations[num], index, filepath]);
            }
        };

        /**
         * Searches pattern in the given subject and applies action on it
         * @todo refactor this
         * @param file
         * @param operation
         * @param fileindex
         * @param filepath
         */
        var _processOperationOnFile = function(file, operation, fileindex, filepath)
        {
            var name = file.updatedName.substring(0, file.updatedName.lastIndexOf('.'));
            var ext = file.updatedName.substring(file.updatedName.lastIndexOf('.'));
            var subject;
            if (operation.applyTo === 'filename')
            {
                subject = name;
            }
            if (operation.applyTo === 'extension')
            {
                subject = ext;
            }
            if (operation.applyTo === 'both')
            {
                subject = file.updatedName;
            }
            if (operation.selection === false || operation.actions.length === 0)
            {
                return subject;
            }
            var selection_callable = app.models.selection[operation.selection.type];
            var patterns = selection_callable(subject, operation.selection.options);
            var updated_subject = _applyPatternsOnSubject.apply(this, [patterns, subject, function(text)
            {
                var updated_text = text;
                for (var index = 0; index < operation.actions.length; index += 1)
                {
                    var action = operation.actions[index];
                    var new_text = app.models.action[action.type](updated_text, fileindex, patterns, action.options, filepath);
                    updated_text = new_text.type === 'remove' ? '' : (new_text.type === 'add' ? updated_text + new_text.text : new_text.text);
                }
                return updated_text;
            }]);
            if (operation.applyTo === 'filename')
            {
                file.updatedName = updated_subject + ext;
            }
            if (operation.applyTo === 'extension')
            {
                file.updatedName = name + updated_subject;
            }
            if (operation.applyTo === 'both')
            {
                file.updatedName = updated_subject;
            }

            // @todo check if filepath exists when doing a stats() in an action; set error otherwise
            file.setError(true, '@todo');

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