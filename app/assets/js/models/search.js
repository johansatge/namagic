/**
 * Search model
 */
(function(app)
{

    'use strict';

    var module = {};

    module.allText = function(subject, options)
    {
        return [{start: 0, length: subject.length}];
    };

    module.freeText = function(subject, options)
    {
        // @todo
        return [];
    };

    module.charsList = function(subject, options)
    {
        // @todo
        return [];
    };

    module.textPosition = function(subject, options)
    {
        // @todo
        return [];
    };

    module.textRange = function(subject, options)
    {
        // @todo
        return [];
    };

    module.regex = function(subject, options)
    {
        // @todo
        return [];
    };

    app.models.search = module;

})(window.App);