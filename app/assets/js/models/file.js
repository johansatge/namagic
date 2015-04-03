/**
 * File model
 */
(function(app)
{

    'use strict';

    var module = function(id, dir, name)
    {

        this.id = id;
        this.dir = dir;
        this.name = name;
        this.hasError = false;
        this.message = '';
        this.updatedName = '';

    };

    app.models.file = module;

})(window.App);