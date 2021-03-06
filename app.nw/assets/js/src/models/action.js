/**
 * Actions model
 */
(function(app)
{

    'use strict';

    var module = {};

    /**
     * Removes text
     */
    module.removeText = function(subject, options, index, count, path)
    {
        return {type: 'replace', text: ''};
    };

    /**
     * Inserts free text
     */
    module.freeText = function(subject, options, index, count, path)
    {
        return {type: 'add', text: options.text};
    };

    /**
     * Inserts a sequence of digits
     */
    module.digitsSequence = function(subject, options, index, count, path)
    {
        var start_index = !isNaN(parseInt(options.startIndex)) ? parseInt(options.startIndex) : 0;
        var step = !isNaN(parseInt(options.step)) ? parseInt(options.step) : 1;
        var num = start_index + (index * step);
        var max_num = start_index + (count * step);
        if (options.add_leading_zeros)
        {
            num = (new Array(max_num.toString().length - num.toString().length + 1).join('0')) + num;
        }
        return {type: 'add', text: num};
    };

    /**
     * Updates text case
     */
    module.updateCase = function(subject, options, index, count, path)
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
     */
    module.creationDate = function(subject, options, index, count, path)
    {
        var birthtime = _getFileStat.apply(this, [path, 'birthtime']);
        return birthtime instanceof Error ? birthtime : {
            type: 'add',
            text: app.utils.string.formatDate(birthtime, options.format)
        };
    };

    /**
     * Inserts last modified date
     */
    module.lastModifiedDate = function(subject, options, index, count, path)
    {
        var mtime = _getFileStat.apply(this, [path, 'mtime']);
        return mtime instanceof Error ? mtime : {
            type: 'add',
            text: app.utils.string.formatDate(mtime, options.format)
        };
    };

    /**
     * Inserts file size
     */
    module.fileSize = function(subject, options, index, count, path)
    {
        var size = _getFileStat.apply(this, [path, 'size']);
        return size instanceof Error ? size : {
            type: 'add',
            text: app.node.filesize(size, {bits: false, spacer: ''})
        };
    };

    /**
     * Returns the stat of a file if available
     * @param file_path
     * @param stat
     */
    var _getFileStat = function(file_path, stat)
    {
        try
        {
            var stats = app.node.fs.statSync(file_path);
            return stats[stat];
        }
        catch (error)
        {
            return new Error(app.utils.locale.get('main.errors.stat_not_found'));
        }
    };

    app.models.action = module;

})(window.App);