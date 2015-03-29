/**
 * Actions model
 */
(function(app)
{

    'use strict';

    var module = {};

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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
        {
            return options.text;
        });
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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
        {
            return start_index + (index * step);
        });
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
        return subject;
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
        return app.utils.string.applyPatternsOnSubject(patterns, subject, function(text)
        {
            return type === 'uppercase' ? text.toUpperCase() : (type === 'lowercase' ? text.toLowerCase() : app.utils.string.inverseCase(text));
        });
    };

    app.models.action = module;

})(window.App);