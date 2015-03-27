/**
 * Search model
 */
(function(app)
{

    'use strict';

    var module = {};

    /**
     * Selects all text
     * @param subject
     * @param options
     */
    module.allText = function(subject, options)
    {
        return [{start: 0, length: subject.length}];
    };

    /**
     * Selects free text
     * @param subject
     * @param options
     */
    module.freeText = function(subject, options)
    {
        // @todo
        return [];
    };

    /**
     * Selects a list of chars
     * @param subject
     * @param options
     * @returns {Array}
     */
    module.charsList = function(subject, options)
    {
        // @todo
        return [];
    };

    /**
     * Select a position in the text
     * @param subject
     * @param options
     */
    module.textPosition = function(subject, options)
    {
        // @todo
        return [];
    };

    /**
     * Select a range of text
     * @param subject
     * @param options
     */
    module.textRange = function(subject, options)
    {
        // @todo
        return [];
    };

    /**
     * Executes a regex
     * @param subject
     * @param options
     */
    module.regex = function(subject, options)
    {
        // @todo
        return [];
    };

    app.models.search = module;

})(window.App);