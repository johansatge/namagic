/**
 * Main model
 */
(function(app)
{

    'use strict';

    var module = function()
    {

        var currentFiles = {};
        var currentFilesIndex = -1;
        var currentOperations = [];

        /**
         * Adds a list of files
         * @param files
         */
        this.addFiles = function(files)
        {
            var new_files = [];
            for (var index in files)
            {
                var file = app.node.path.parse(files[index]);
                var id = app.node.crypto.createHash('md5').update(files[index]).digest('hex');
                if (typeof currentFiles[id] === 'undefined')
                {
                    currentFilesIndex += 1;
                    var name = file.name + file.ext;
                    var new_file = {
                        id: id,
                        dir: file.dir,
                        name: name,
                        updated_name: _applyOperationsOnFilename.apply(this, [name, file.dir + '/' + name, currentFilesIndex])
                    };
                    new_files.push(new_file);
                    currentFiles[id] = new_file;
                }
            }
            return new_files;
        };

        /**
         * Removes a list of files
         * @param ids
         */
        this.removeFiles = function(ids)
        {
            for (var index = 0; index < ids.length; index += 1)
            {
                delete currentFiles[ids[index]];
                currentFilesIndex -= 1;
            }
        };

        /**
         * Applies given operations on the current list of files and returns it
         * @param operations
         */
        this.applyOperations = function(operations)
        {
            currentOperations = operations;
            var index = 0;
            for (var id in currentFiles)
            {
                var file = currentFiles[id];
                currentFiles[id].updated_name = _applyOperationsOnFilename.apply(this, [file.name, file.dir + '/' + file.name, index]);
                index += 1;
            }
            return currentFiles;
        };

        /**
         * Applies given operations on a filename
         * @param filename
         */
        var _applyOperationsOnFilename = function(filename, filepath, index)
        {
            for (var num in currentOperations)
            {
                var operation = currentOperations[num];
                var name = filename.substring(0, filename.lastIndexOf('.'));
                var ext = filename.substring(filename.lastIndexOf('.'));
                if (operation.applyTo === 'filename')
                {
                    filename = _applyOperation.apply(this, [name, operation.selection, operation.actions, index, filepath]) + ext;
                }
                if (operation.applyTo === 'extension')
                {
                    filename = name + _applyOperation.apply(this, [ext, operation.selection, operation.actions, index, filepath]);
                }
                if (operation.applyTo === 'both')
                {
                    filename = _applyOperation.apply(this, [filename, operation.selection, operation.actions, index, filepath]);
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
        var _applyOperation = function(subject, selection, actions, index, filepath)
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