module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var glob = require('glob');
    var uglifyjs = require('uglify-js');
    var exec = require('child_process').exec;
    var Builder = require('nwjs-macappstore-builder');
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    //var appExecutable = 'node-webkit';
    var appExecutable = 'nwjs';
    var sourceApp = '/Applications/' + appExecutable + '.app';
    var appName = 'Namagic.app';
    var identity = 'LK7U6U8DZ4' // @todo move this elsewhere

    grunt.log.writeln('Uses ' + appExecutable + '.');

    /**
     * Watches SASS files
     */
    grunt.registerTask('sass', function()
    {
        var done = this.async();
        var child = exec('cd app.nw/assets && compass watch sass/main.scss');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec(sourceApp + '/Contents/MacOS/' + appExecutable + ' app.nw');
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
        setDevMode(false);
        var config = {
            nwjs_path: '/Applications/nwjs.app',
            source_path: 'app.nw',
            build_path: '.mas',
            name: manifest.name,
            bundle_id: manifest.bundle_identifier,
            version: manifest.version,
            bundle_version: manifest.bundle_version,
            copyright: manifest.copyright,
            icon_path: 'assets/icon/icon.icns',
            identity: identity,
            entitlements: [
                'com.apple.security.files.user-selected.read-write'
            ],
            app_category: 'public.app-category.utilities',
            app_sec_category: 'public.app-category.productivity'
        };
        var builder = new Builder();
        builder.build(config, function(error, app_path)
        {
            console.log(error ? error.message : 'Build done: ' + app_path);
        }, true);
    });

    /**
     * Packages the app
     */
    grunt.registerTask('pkg', function()
    {
        var done = this.async();
        var command = 'cd .mas && productbuild --component "' + appName + '" /Applications  --sign "' + identity + '" ' + appName.replace('.app', '.pkg');
        exec(command, function(error, stdout, stderr)
        {
            grunt.log.writeln(stdout);
            done();
        });
    });

    /**
     * Toggles dev mode
     * @param enable
     */
    function setDevMode(enable)
    {
        grunt.file.write('./app.nw/.dev', enable ? '1' : '0', {encoding: 'utf8'});
    }

};