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
        return [{start: 0, end: subject.length}];
    };

    /**
     * Selects free text
     * @param subject
     * @param options
     */
    module.freeText = function(subject, options)
    {
        var matches = [];
        if (options.text !== '')
        {
            var regex = new RegExp(_quoteRegex(options.text), options.caseInsensitive ? 'gi' : 'g');
            var match;
            while ((match = regex.exec(subject)) !== null)
            {
                matches.push({start: match.index, end: match.index + match[0].length});
            }
        }
        return matches;
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
        // options.customList
        // options.alphabeticChars
        // options.digits
        // options.specialChars
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
        // options.index
        // options.fromEnd
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
        // options.startIndex
        // options.startFromEnd
        // options.endIndex
        // options.endFromEnd
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
        // options.regex
        // options.isGlobal
        // options.caseInsensitive
        return [];
    };

    /**
     * Quotes the given subject to be used in a regex
     * @param subject
     */
    var _quoteRegex = function(subject)
    {
        var regex = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
        return subject.replace(regex, '\\$&');
    };

    app.models.search = module;

})(window.App);