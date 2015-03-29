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
                    filename = _applyOperation.apply(this, [name, operation.search, operation.actions, index, filepath]) + ext;
                }
                if (operation.applyTo === 'extension')
                {
                    filename = name + _applyOperation.apply(this, [ext, operation.search, operation.actions, index, filepath]);
                }
                if (operation.applyTo === 'both')
                {
                    filename = _applyOperation.apply(this, [filename, operation.search, operation.actions, index, filepath]);
                }
            }
            return filename;
        };

        /**
         * Searches pattern in the given subject and applies action on it
         * @param subject
         * @param search
         * @param actions
         * @param index
         * @param filepath
         */
        var _applyOperation = function(subject, search, actions, index, filepath)
        {
            if (search === false || actions.length === 0)
            {
                return subject;
            }
            //var action = actions.length > 0 ? actions[0] : false;
            var search_callable = app.models.search[search.type];
            //            var action_callable = app.models.action[action.type];
            var patterns = search_callable(subject, search.options);

            // @todo apply multiple actions on the same search subject
            // @todo process patterns and apply each action in each pattern loop ?

            return _applyPatternsOnSubject.apply(this, [patterns, subject, function(text)
            {
                var updated_text = text;
                for (var index = 0; index < actions.length; index += 1)
                {
                    var action = actions[index];
                    var new_text = app.models.action[action.type](text, index, patterns, action.options, filepath);
                    updated_text = new_text !== false ? updated_text + new_text : '';
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