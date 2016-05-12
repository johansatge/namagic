module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var glob = require('glob');
    var chokidar = require('chokidar');
    var uglifyjs = require('uglify-js');
    var minifyhtml = require('html-minifier').minify;
    var exec = require('child_process').exec;
    var execSync = require('child_process').execSync;
    var Builder = require('nwjs-macappstore-builder');
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    var appName = 'Namagic.app';
    var identity = 'LK7U6U8DZ4' // @todo move this elsewhere

    /**
     * Watches SASS files
     */
    grunt.registerTask('sass:watch', function()
    {
        var done = this.async();
        var child = exec('cd app.nw/assets && compass watch sass/*.scss');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Watches JS files
     */
    grunt.registerTask('js:watch', function()
    {
        var done = this.async();
        chokidar.watch(['app.nw/assets/js/src/**/*']).on('change', function(evt, path)
        {
            console.log('Compiling JS...');
            grunt.task.run('js:compile');
        });
    });

    /**
     * Compiles JS files
     */
    grunt.registerTask('js:compile', function()
    {
        var files = [
            'app.nw/assets/js/src/app.js',

            'app.nw/assets/js/src/utils/log.js',
            'app.nw/assets/js/src/utils/locale.js',
            'app.nw/assets/js/src/utils/windowbootstrap.js',
            'app.nw/assets/js/src/utils/windowmanager.js',
            'app.nw/assets/js/src/utils/template.js',
            'app.nw/assets/js/src/utils/menubar.js',
            'app.nw/assets/js/src/utils/string.js',
            'app.nw/assets/js/src/utils/dom.js',

            'app.nw/assets/js/src/models/main.js',
            'app.nw/assets/js/src/models/selection.js',
            'app.nw/assets/js/src/models/action.js',
            'app.nw/assets/js/src/models/file.js',

            'app.nw/assets/js/src/views/main.js',
            'app.nw/assets/js/src/views/files.js',
            'app.nw/assets/js/src/views/operations.js',

            'app.nw/assets/js/src/controllers/main.js'
        ];
        var uglified = uglifyjs.minify(files);
        fs.writeFileSync('app.nw/assets/js/src.min.js', uglified.code, {encoding: 'utf8'});
    });

    /**
     * Compiles JS libs
     */
    grunt.registerTask('js:libs', function()
    {
        var files = [
            'app.nw/assets/js/libs/jquery-2.1.1.min.js',
            'app.nw/assets/js/libs/jqueryui-1.11.3.min.js'
        ];
        var uglified = uglifyjs.minify(files);
        fs.writeFileSync('app.nw/assets/js/libs.min.js', uglified.code, {encoding: 'utf8'});
    });

    /**
     * Watches HTML files
     */
    grunt.registerTask('js:watch', function()
    {
        var done = this.async();
        chokidar.watch(['app.nw/assets/html/src/**/*']).on('change', function(evt, path)
        {
            console.log('Compiling HTML...');
            grunt.task.run('html:compile');
        });
    });

    /**
     * Compiles HTML files
     */
    grunt.registerTask('html:compile', function()
    {
        var options = {
            minifyJS: true,
            html5: true,
            collapseWhitespace: true,
            removeComments: true,
            processScripts: ['text/template']
        };
        var html_dateformats = minifyhtml(fs.readFileSync('app.nw/templates/src/dateformats.html', 'utf8'), options);
        var html_main = minifyhtml(fs.readFileSync('app.nw/templates/src/main.html', 'utf8'), options);

        fs.writeFileSync('app.nw/templates/dateformats.min.html', html_dateformats, 'utf8');
        fs.writeFileSync('app.nw/templates/main.min.html', html_main, 'utf8');
    });

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec('/Applications/nwjs.app/Contents/MacOS/nwjs app.nw');
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

        // Copies app.nw
        execSync('cp -R app.nw app.nw.build');

        // Removes assets (SASS, uncompressed JS...)
        execSync('rm -r app.nw.build/assets/sass');
        execSync('rm -r app.nw.build/assets/js/libs');
        execSync('rm -r app.nw.build/assets/js/src');
        execSync('rm -r app.nw.build/templates/src');
        execSync('rm app.nw.build/assets/config.rb');
        execSync('rm app.nw.build/.dev');

        // Builds and packages final app
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
            uglify_js: false
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
     */
    function setDevMode(enable)
    {
        grunt.file.write('./app.nw/.dev', enable ? '1' : '0', {encoding: 'utf8'});
    }

};
