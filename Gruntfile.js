module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var glob = require('glob');
    var uglifyjs = require('uglify-js');
    var exec = require('child_process').exec;
    var execSync = require('child_process').execSync;
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
        var child = exec('cd app.nw/assets && compass watch sass/*.scss');
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
        execSync('cp -R app.nw app.nw.build');
        execSync('rm app.nw.build/node_modules/filesize/lib/filesize.es6.js'); // TMP fix: uglifyjs ne minifie pas ES6
        execSync('rm -r app.nw.build/assets/sass');
        execSync('rm app.nw.build/assets/config.rb');
        execSync('rm app.nw.build/.dev');
        var config = {
            nwjs_path: '/Applications/nwjs.app',
            source_path: 'app.nw.build',
            build_path: '.mas',
            name: manifest.name,
            bundle_id: manifest.bundle_identifier,
            version: manifest.version,
            bundle_version: manifest.bundle_version,
            copyright: manifest.copyright,
            icon_path: 'assets/icon/icon.icns',
            identity: identity,
            identity_installer: identity,
            entitlements: [
                'com.apple.security.files.user-selected.read-write'
            ],
            app_category: 'public.app-category.utilities',
            app_sec_category: 'public.app-category.productivity',
            uglify_js: true
        };
        var builder = new Builder();
        builder.build(config, function(error, app_path)
        {
            execSync('rm -r app.nw.build');
            console.log(error ? error.message : 'Build done: ' + app_path);
        }, true);
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
