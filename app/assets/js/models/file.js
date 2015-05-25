/**
 * File model
 */
(function(m)
{

    'use strict';

    var unorm = require('unorm');
    var fs = require('fs');

    var module = function(_id, _dir, _name)
    {

        var applyCallback;

        this.id = _id;
        this.name = unorm.nfkc(_name);
        this.directory = _dir;
        this.hasError = false;
        this.showOverwrites = false;
        this.errorMessage = '';
        this.updatedName = '';

        /**
         * Checks if the destination path already exists
         * @param destination_dir
         */
        this.destinationExists = function(destination_dir)
        {
            if (destination_dir === directory)
            {
                return false;
            }
            var exists;
            try
            {
                fs.readFileSync(destination_dir + '/' + updatedName);
                exists = true;
            }
            catch (error)
            {
                exists = false;
            }
            return exists;
        };

        /**
         * Asynchronously applies the updated name on the file
         * @param destination_dir
         * @param callback
         */
        this.applyUpdatedName = function(destination_dir, callback)
        {
            applyCallback = callback;
            fs.rename(directory + '/' + name, destination_dir + '/' + updatedName, _updatedNameApplied.bind(this));
        };

        /**
         * Triggers the needed callback when the file has been modified
         * @param error
         */
        var _updatedNameApplied = function(error)
        {
            if (error)
            {
                this.setError(true, error.message);
            }
            applyCallback(this, error ? false : true);
        };

        /**
         * Applies given operations on the file and returns TRUE if the name has been changed (FALSE otherwise)
         * @param operations
         * @param file_index
         */
        this.processOperations = function(operations, file_index)
        {
            var old_updated_name = this.updatedName;
            this.setError(false, '');
            this.updatedName = this.name;
            var file_path = this.directory + '/' + this.name;
            for (var op_index = 0; op_index < operations.length; op_index += 1)
            {
                var op = operations[op_index];
                if (op.selection === false || op.actions.length === 0)
                {
                    continue;
                }
                var name_part;
                var extension_part;
                if (this.updatedName.indexOf('.') !== -1)
                {
                    name_part = this.updatedName.substring(0, this.updatedName.lastIndexOf('.'));
                    extension_part = this.updatedName.substring(this.updatedName.lastIndexOf('.'));
                }
                else
                {
                    name_part = this.updatedName;
                    extension_part = '';
                }
                if (op.applyTo === 'filename')
                {
                    this.updatedName = _processText.apply(this, [name_part, op.selection, op.actions, file_index, file_path]) + extension_part;
                }
                if (op.applyTo === 'extension')
                {
                    this.updatedName = name_part + _processText.apply(this, [extension_part, op.selection, op.actions, file_index, file_path]);
                }
                if (op.applyTo === 'both')
                {
                    this.updatedName = _processText.apply(this, [this.updatedName, op.selection, op.actions, file_index, file_path]);
                }
            }
            if (this.updatedName === '')
            {
                this.setError(true, app.utils.locale.get('main.errors.empty_filename'));
            }
            return this.updatedName !== old_updated_name;
        };

        /**
         * Searches for ranges of text in the given subject and applies actions on each one
         * For each range:
         * - Adds the text that comes before (after the end of the previous range or from 0)
         * - Applies the actions (an action adds text or replaces the existing one)
         * - Appends the remaining text
         * @param subject
         * @param selection
         * @param actions
         * @param file_index
         * @param file_path
         */
        var _processText = function(subject, selection, actions, file_index, file_path)
        {
            var ranges = app.models.selection[selection.type](subject, selection.options);
            var updated_subject = '';
            var previous_range = false;
            var range = false;
            for (var range_index = 0; range_index < ranges.length; range_index += 1)
            {
                range = ranges[range_index];
                updated_subject += subject.substring(previous_range !== false ? previous_range.end : 0, range.start);
                var updated_subject_part = subject.substring(range.start, range.end);
                for (var act_index = 0; act_index < actions.length; act_index += 1)
                {
                    var action_callable = app.models.action[actions[act_index].type];
                    var new_text = action_callable(updated_subject_part, actions[act_index].options, file_index, file_path);
                    if (new_text instanceof Error)
                    {
                        this.setError(true, new_text.message);
                        updated_subject_part = app.utils.locale.get('main.errors.error');
                    }
                    else
                    {
                        updated_subject_part = new_text.type === 'add' ? updated_subject_part + new_text.text : new_text.text;
                    }
                }
                updated_subject += updated_subject_part;
                previous_range = range;
            }
            return range !== false ? updated_subject + subject.substring(range.end) : subject;
        };

        /**
         * Returns the ID of the file
         */
        this.getID = function()
        {
            return id;
        };

        /**
         * Returns the name of the file
         */
        this.getName = function()
        {
            return this.name;
        };

        this.getUpdatedName = function()
        {
            return this.updatedName;
        };

        /**
         * Returns the directory of the file
         */
        this.getDirectory = function()
        {
            return this.directory;
        };

        /**
         * Sets the error status of the file
         * @param has_error
         * @param text
         * @param overwrites
         */
        this.setError = function(has_error, text, overwrites)
        {
            this.hasError = has_error ? true : false;
            this.showOverwrites = overwrites ? true : false;
            this.errorMessage = text;
        };

        /**
         * Returns the error status of the file
         */
        this.getError = function()
        {
            return this.hasError ? {message: this.errorMessage, overwrites: this.showOverwrites} : false;
        };

    };

    m.exports = module;

})(module);