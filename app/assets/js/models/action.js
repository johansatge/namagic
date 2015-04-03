/**
 * Actions model
 */
(function(app)
{

    'use strict';

    var module = {};

    /**
     * Removes text
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.removeText = function(subject, index, patterns, options, path)
    {
        return {type: 'remove', text: ''};
    };

    /**
     * Inserts free text
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.freeText = function(subject, index, patterns, options, path)
    {
        return {type: 'add', text: options.text};
    };

    /**
     * Inserts a sequence of digits
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.digitsSequence = function(subject, index, patterns, options, path)
    {
        var start_index = !isNaN(parseInt(options.startIndex)) ? parseInt(options.startIndex) : 0;
        var step = !isNaN(parseInt(options.step)) ? parseInt(options.step) : 1;
        return {type: 'add', text: start_index + (index * step)};
    };

    /**
     * Updates text case
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.updateCase = function(subject, index, patterns, options, path)
    {
        if (options.type === 'uppercase')
        {
            subject = subject.toUpperCase();
        }
        if (options.type === 'lowercase')
        {
            subject = subject.toLowerCase();
        }
        if (options.type === 'invert')
        {
            subject = app.utils.string.inverseCase(subject);
        }
        return {type: 'replace', text: subject};
    };

    /**
     * Inserts creation date
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.creationDate = function(subject, index, patterns, options, path)
    {
        var stats = app.node.fs.statSync(path);
        var date = stats.birthtime !== 'undefined' ? app.utils.string.formatDate(stats.birthtime, options.format) : '/!\\';
        return {type: 'add', text: date};
    };

    /**
     * Inserts last modified date
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.lastModifiedDate = function(subject, index, patterns, options, path)
    {
        var stats = app.node.fs.statSync(path);
        var date = stats.mtime !== 'undefined' ? app.utils.string.formatDate(stats.mtime, options.format) : '/!\\';
        return {type: 'add', text: date};
    };

    /**
     * Inserts file size
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.fileSize = function(subject, index, patterns, options, path)
    {
        var stats = app.node.fs.statSync(path);
        return {type: 'add', text: app.node.filesize(stats.size, {bits: true, spacer: ''})};
    };

    app.models.action = module;

})(window.App);