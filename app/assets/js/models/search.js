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
        // @todo test this function
        var regex_parts = [];
        if (options.customList !== '')
        {
            regex_parts.push('[' + _quoteRegex(options.customList) + ']+');
        }
        if (options.alphabeticChars)
        {
            regex_parts.push('[a-zA-Z]+');
        }
        if (options.digits)
        {
            regex_parts.push('[0-9]+');
        }
        if (options.specialChars)
        {
            regex_parts.push('[^a-zA-Z0-9]+');
        }
        if (regex_parts.length === 0)
        {
            return [];
        }
        var regex = new RegExp('(' + regex_parts.join('|') + ')', 'g');
        var matches = [];
        var match;
        while ((match = regex.exec(subject)) !== null)
        {
            matches.push({start: match.index, end: match.index + match[0].length});
        }
        return matches;
    };

    /**
     * Select a position in the text
     * @param subject
     * @param options
     */
    module.textPosition = function(subject, options)
    {
        var index = !isNaN(parseInt(options.index)) ? parseInt(options.index) : false;
        if (index !== false)
        {
            var real_index = !options.fromEnd ? index : subject.length - index;
            return [{start: real_index, end: real_index}];
        }
        return [];
    };

    /**
     * Select a range of text
     * @param subject
     * @param options
     */
    module.textRange = function(subject, options)
    {
        var index = !isNaN(parseInt(options.index)) ? parseInt(options.index) : false;
        var length = !isNaN(parseInt(options.length)) ? parseInt(options.length) : false;
        if (index !== false && length !== false)
        {
            var real_index = !options.fromEnd ? index : subject.length - index - length;
            return [{start: real_index, end: real_index + length}];
        }
        return [];
    };

    /**
     * Executes a regex
     * @param subject
     * @param options
     */
    module.regex = function(subject, options)
    {
        var regex = false;
        var matches = [];
        try
        {
            regex = options.regex !== '' ? new RegExp(options.regex, (options.isGlobal ? 'g' : '') + (options.caseInsensitive ? 'i' : '')) : false;
        }
        catch (error)
        {
            regex = false;
        }
        if (regex !== false)
        {
            var match;
            while ((match = regex.exec(subject)) !== null)
            {
                matches.push({start: match.index, end: match.index + match[0].length});
                if (!options.isGlobal)
                {
                    break;
                }
            }
        }
        return matches;
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