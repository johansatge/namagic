module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var glob = require('glob');
    var uglifyjs = require('uglify-js');
    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    //var appExecutable = 'node-webkit';
    var appExecutable = 'nwjs';
    var sourceApp = '/Applications/' + appExecutable + '.app';
    var appName = 'Namagic.app';
    var identity = 'LK7U6U8DZ4' // @todo move this elsewhere
    var bundleID = manifest.bundle_identifier;

    grunt.log.writeln('Uses ' + appExecutable + '.');

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
     * Use the "--dev" option to enable toolbars and debug
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
                grunt.log.writeln('Cleaning...');
                exec('rm -r .mas;mkdir .mas', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Creating empty application...');
                exec('cp -r ' + sourceApp + ' .mas/' + appName, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Removing FFMpeg binary...');
                exec('rm ".mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Framework.framework/Libraries/ffmpegsumo.so"', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Installing icon...');
                exec('cp assets/icon/icon.icns .mas/' + appName + '/Contents/Resources/nw.icns', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Updating app plist file...');
                var plist = fs.readFileSync('assets/plist/info.plist', {encoding: 'utf8'});
                var stats = fs.statSync('.mas/' + appName + '/Contents/Info.plist');
                for (var property in manifest)
                {
                    plist = plist.replace(new RegExp('{{' + property + '}}', 'g'), manifest[property]);
                }
                plist = plist.replace(new RegExp('{{executable}}', 'g'), appExecutable);
                fs.writeFile('.mas/' + appName + '/Contents/Info.plist', plist, {
                    encoding: 'utf8',
                    mode: stats.mode
                }, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Updating helper plist files...');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper.app', bundleID + '.helper');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper EH.app', bundleID + '.helper.eh');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper NP.app', bundleID + '.helper.np');
                callback();
            },
            function(callback)
            {
                grunt.log.writeln('Installing app files...');
                exec('cp -r app.nw .mas/' + appName + '/Contents/Resources', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Minifies JS...');
                var js_path = '.mas/' + appName + '/Contents/Resources/app.nw/assets/';
                glob('**/*.js', {cwd: js_path}, function(error, files)
                {
                    for (var index = 0; index < files.length; index += 1)
                    {
                        if (files[index].search('.min.') !== -1)
                        {
                            continue;
                        }
                        grunt.log.writeln('Minifies ' + files[index] + '...');
                        var minified = uglifyjs.minify(js_path + files[index]);
                        fs.writeFileSync(js_path + files[index], minified.code, {encoding: 'utf8'});
                    }
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Cleaning built app...');
                exec('cd .mas/' + appName + ' && find . -name "*.DS_Store" -type f -delete', function()
                {
                    exec('rm -r .mas/' + appName + '/Contents/Resources/app.nw/assets/sass', function()
                    {
                        exec('rm -r .mas/' + appName + '/Contents/Frameworks/crash_inspector', function()
                        {
                            callback();
                        });
                    });
                });
            },
            function(callback)
            {
                grunt.log.writeln('Setting permissions...');
                exec('cd .mas/' + appName + '/Contents/Resources/app.nw && find . -type f | xargs chmod -v 644', callback);
            }
        ];
        async.series(series, function()
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
        var child_ent = 'assets/entitlements/child.plist';
        var parent_ent = 'assets/entitlements/parent.plist';
        var cmd = 'codesign --deep -s $1 -i $2 --entitlements $3 "$4"';
        var series = [
            function(callback)
            {
                grunt.log.writeln('Signing ' + appExecutable + ' Helper.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper.app';
                var bundle_id = bundleID + '.helper';
                exec(cmd.replace('$1', identity).replace('$2', bundle_id).replace('$3', child_ent).replace('$4', app_path), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing ' + appExecutable + ' Helper EH.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper EH.app';
                var bundle_id = bundleID + '.helper.eh';
                exec(cmd.replace('$1', identity).replace('$2', bundle_id).replace('$3', child_ent).replace('$4', app_path), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing ' + appExecutable + ' Helper NP.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/' + appExecutable + ' Helper NP.app';
                var bundle_id = bundleID + '.helper.np';
                exec(cmd.replace('$1', identity).replace('$2', bundle_id).replace('$3', child_ent).replace('$4', app_path), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing app...');
                var app_path = '.mas/' + appName;
                exec(cmd.replace('$1', identity).replace('$2', bundleID).replace('$3', parent_ent).replace('$4', app_path), callback);
            }
        ];
        async.series(series, function()
        {
            done();
        });
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
     * Updates the Info.plist file of the needed helper app
     * @param helper_path
     * @param bundle_id
     */
    function updateHelperPlist(helper_path, bundle_id)
    {
        var plist = fs.readFileSync(helper_path + '/Contents/Info.plist', {encoding: 'utf8'});
        var stats = fs.statSync(helper_path + '/Contents/Info.plist');
        plist = plist.replace(/<key>CFBundleIdentifier<\/key>[^\/]*\/string>/g, '<key>CFBundleIdentifier<\/key>\n	<string>' + bundle_id + '</string>');
        fs.writeFileSync(helper_path + '/Contents/Info.plist', plist, {encoding: 'utf8', mode: stats.mode});
    }

};