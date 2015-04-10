module.exports = function(grunt)
{

    'use strict';

    var exec = require('child_process').exec;

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec('node_modules/nw/nwjs/nwjs.app/Contents/MacOS/nwjs app');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Builds the app
     */
    grunt.registerTask('build', function()
    {
        var done = this.async();
        grunt.log.writeln('Cleaning...');
        exec('rm -r macappstore/nwjs.app', function(error, stdout, stderr)
        {
            grunt.log.writeln('Copying empty application...');
            exec('cp -r node_modules/nw/nwjs/nwjs.app macappstore', function(error, stdout, stderr)
            {
                grunt.log.writeln('Installing icon...');
                exec('cp assets/icns/icon.icns macappstore/nwjs.app/Contents/Resources/nw.icns', function(error, stdout, stderr)
                {
                    grunt.log.writeln('Installing plist...');
                    exec('cp assets/plist/info.plist macappstore/nwjs.app/Contents/Info.plist', function(error, stdout, stderr)
                    {
                        done();
                    });
                });
            });
        });
    });

    /**
     * Toggles dev mode
     * @param enable
     */
    function setDevMode(enable)
    {
        grunt.file.write('./app/.dev', enable ? '1' : '0', {encoding: 'utf8'});
    }

};