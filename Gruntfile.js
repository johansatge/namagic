module.exports = function(grunt)
{

    'use strict';

    var fs = require('fs');
    var exec = require('child_process').exec;
    var manifest = JSON.parse(fs.readFileSync('app/package.json', {encoding: 'utf8'}));
    var identity = 'LK7U6U8DZ4'; // @todo move this elsewhere

    /**
     * Watches SASS files
     */
    grunt.registerTask('sass', function()
    {
        var done = this.async();
        var child = exec('cd app/assets && compass watch sass/main.scss');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Runs the app
     */
    grunt.registerTask('run', function()
    {
        var done = this.async();
        var child = exec('tint app/app.js');
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
        var series = [
            function(callback)
            {
                grunt.log.writeln('Building app...');
                exec('tntbuild --out .build --clean --no-windows-build app/package.json', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Looking for JS...');
                var js_path = '.build/MacOS X/' + manifest.name + '.app' + '/Contents/Resources/assets/';
                require('glob')('**/*.js', {cwd: js_path}, function(error, files)
                {
                    grunt.log.writeln('Minifying ' + files.length + ' JS files...');
                    var uglifyjs = require('uglify-js');
                    files.map(function(path)
                    {
                        if (path.search('.min.') === -1)
                        {
                            fs.writeFileSync(js_path + path, uglifyjs.minify(js_path + path).code, {encoding: 'utf8'});
                        }
                    });
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Looking for HTML...');
                var html_path = '.build/MacOS X/' + manifest.name + '.app' + '/Contents/Resources/assets/';
                require('glob')('**/*.html', {cwd: html_path}, function(error, files)
                {
                    grunt.log.writeln('Minifying ' + files.length + ' HTML files...');
                    var htmlminifier = require('html-minifier').minify;
                    files.map(function(path)
                    {
                        var code = htmlminifier(fs.readFileSync(html_path + path, {encoding: 'utf8'}), {
                            removeComments: true,
                            minifyJS: true,
                            preserveLineBreaks: false,
                            collapseWhitespace: true
                        });
                        fs.writeFileSync(html_path + path, code, {encoding: 'utf8'});
                    });
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Cleaning app...');
                exec('rm -r ".build/MacOS X/' + manifest.name + '.app' + '/Contents/Resources/assets/sass"', callback);
            }
        ];
        require('async').series(series, function()
        {
            done();
        });
    });

    /**
     * Signs the app
     */
    grunt.registerTask('sign', function()
    {
        var done = this.async();
        grunt.log.writeln('Signing app...');
        var command = 'codesign --deep -s $1 -i $2 --entitlements $3 "$4"'
            .replace('$1', identity)
            .replace('$2', manifest.namespace)
            .replace('$3', 'assets/entitlements.plist')
            .replace('$4', '.build/MacOS X/' + manifest.name + '.app');
        exec(command, done);
    });

    /**
     * Packages the app
     */
    grunt.registerTask('pkg', function()
    {
        var done = this.async();
        grunt.log.writeln('Packaging app...');
        var command = 'cd ".build/MacOS X" && productbuild --component "$1.app" $2  --sign "$3" $4.pkg'
            .replace('$1', manifest.name)
            .replace('$2', '/Applications')
            .replace('$3', identity)
            .replace('$4', manifest.name);
        exec(command, done);
    });

};