/**
 * Log utils
 */
(function(app)
{

    'use strict';

    /**
     * Readable console.log
     * @param thing
     */
    var module = function(thing)
    {
        var output = typeof thing === 'string' ? thing : app.node.util.inspect(thing);
        process.stdout.write("\n" + output + "\n");
    };

    app.utils.log = module;

})(window.App);