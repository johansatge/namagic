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
        return false;
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
        return options.text;
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
        return start_index + (index * step);
    };

    /**
     * Inserts date and time
     * @param subject
     * @param index
     * @param patterns
     * @param options
     * @param path
     */
    module.dateAndTime = function(subject, index, patterns, options, path)
    {
        var stats = app.node.fs.statSync(path);
        // @todo
        // options.type (creation / modification / today)
        // options.format
        app.utils.log(stats);
        return '1970-01-01';
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
        if (typeof options.type === 'undefined' || options.type === '')
        {
            return subject;
        }
        var type = options.type;
        return type === 'uppercase' ? subject.toUpperCase() : (type === 'lowercase' ? subject.toLowerCase() : app.utils.string.inverseCase(subject));
    };

    app.models.action = module;

})(window.App);