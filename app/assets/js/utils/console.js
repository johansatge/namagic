/**
 * Console and errors in webviews
 */
(function(window, console)
{
    /**
     * console.log
     */
    console.log = function()
    {
        return function()
        {
            window.postMessageToHost(JSON.stringify({type: 'console', data: Array.prototype.slice.call(arguments).join(' - ')}));
        };
    }(console.log);

    /**
     * Errors
     * @param error
     * @param url
     * @param line
     */
    window.onerror = function(error, url, line)
    {
        window.postMessageToHost(JSON.stringify({type: 'console', data: 'Error: ' + error + ' Script: ' + url + ' Line: ' + line}));
    };

}(window, console));