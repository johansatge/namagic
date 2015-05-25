/**
 * Locale utils
 */
(function(window)
{

    'use strict';

    var module = {};
    var strings = {};

    /**
     * Inits locale module
     * @param json
     */
    module.init = function(json)
    {
        _parseObject('', json);
    };

    /**
     * Gets a locale string
     * @param id
     */
    module.get = function(id)
    {
        return typeof strings[id] !== 'undefined' ? strings[id] : id;
    };

    /**
     * Gets all locale strings
     */
    module.getAll = function()
    {
        return strings;
    };

    /**
     * Parses an object and makes its hierarchy flat by using dots (.)
     * @param prefix
     * @param json
     */
    var _parseObject = function(prefix, json)
    {
        for (var index in json)
        {
            if (typeof json[index] === 'string')
            {
                strings[prefix + (prefix !== '' ? '.' : '') + index] = json[index];
            }
            else
            {
                _parseObject(prefix + (prefix !== '' ? '.' : '') + index, json[index]);
            }
        }
    };

    window.Locale = module;

})(window);