module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    var sourceApp = '/Applications/node-webkit.app';
    var appName = 'Namagic.app';
    var identity = 'LK7U6U8DZ4' // @todo move this elsewhere
    var bundleID = manifest.bundle_identifier;

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
        var child = exec(sourceApp + '/Contents/MacOS/node-webkit app.nw');
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
        var series = [
            function(callback)
            {
                grunt.log.writeln('Cleaning...');
                exec('rm -r .mas && mkdir .mas', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Creating empty application...');
                exec('cp -r ' + sourceApp + ' .mas/' + appName, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Removing FFMpeg binary...');
                exec('rm ".mas/' + appName + '/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so"', callback);
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
                fs.writeFile('.mas/' + appName + '/Contents/Info.plist', plist, {
                    encoding: 'utf8',
                    mode: stats.mode
                }, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Updating helper plist files...');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/node-webkit Helper.app', bundleID + '.helper');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/node-webkit Helper EH.app', bundleID + '.helper.eh');
                updateHelperPlist('.mas/' + appName + '/Contents/Frameworks/node-webkit Helper NP.app', bundleID + '.helper.np');
                callback();
            },
            function(callback)
            {
                grunt.log.writeln('Installing app files...');
                exec('cp -r app.nw .mas/' + appName + '/Contents/Resources', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Cleaning built app...');
                exec('cd .mas/' + appName + ' && find . -name "*.DS_Store" -type f -delete', callback);
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
                grunt.log.writeln('Signing node-webkit Helper.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/node-webkit Helper.app';
                var bundle_id = bundleID + '.helper';
                exec(cmd.replace('$1', identity).replace('$2', bundle_id).replace('$3', child_ent).replace('$4', app_path), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing node-webkit Helper EH.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/node-webkit Helper EH.app';
                var bundle_id = bundleID + '.helper.eh';
                exec(cmd.replace('$1', identity).replace('$2', bundle_id).replace('$3', child_ent).replace('$4', app_path), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing node-webkit Helper NP.app...');
                var app_path = '.mas/' + appName + '/Contents/Frameworks/node-webkit Helper NP.app';
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

    /**
     * Toggles dev mode
     * @param enable
     */
    function setDevMode(enable)
    {
        grunt.file.write('./app.nw/.dev', enable ? '1' : '0', {encoding: 'utf8'});
    }

};