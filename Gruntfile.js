module.exports = function(grunt)
{

    'use strict';

    var exec = require('child_process').exec;
    var nwb = require('node-webkit-builder');

    grunt.registerTask('default', []);

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec('/Applications/nwjs.app/Contents/MacOS/nwjs ./app');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Builds the app
     */
    grunt.registerTask('build', function()
    {
        var builder = new nwb(
            {
                files: './app/**/**',
                platforms: ['osx'],
                buildDir: './build',
                macCredits: false,
                macIcns: './assets/icns/icon.icns'
            });
        var done = this.async();
        grunt.log.writeln('Building app...');
        setDevMode(false);
        builder.build().then(function()
        {
            grunt.log.ok('Build done.');
            if (grunt.option('launch'))
            {
                exec('./build/Namage/osx/Namage.app/Contents/MacOS/nwjs');
            }
            done();
        }).catch(function(error)
        {
            grunt.log.error(error);
            done();
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