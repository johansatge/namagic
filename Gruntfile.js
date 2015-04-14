module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var util = require('util');
    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    var source_app = '/Applications/node-webkit.app';
    var app_name = 'Namagic.app';
    var identity = 'LK7U6U8DZ4' // @todo move this elsewhere
    var bundle_id = manifest.bundle_identifier;

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec(source_app + '/Contents/MacOS/node-webkit app.nw');
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
                exec('cp -r ' + source_app + ' .mas/' + app_name, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Building icon...');
                exec('makeicns -in assets/icon/icon.png -out assets/icon/icon.icns', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Installing icon...');
                exec('mv assets/icon/icon.icns .mas/' + app_name + '/Contents/Resources/nw.icns', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Installing plist...');
                var plist = fs.readFileSync('assets/plist/info.plist', {encoding: 'utf8'});
                var stats = fs.statSync('.mas/' + app_name + '/Contents/Info.plist');
                for (var property in manifest)
                {
                    var regex = new RegExp('{{' + property + '}}', 'g');
                    plist = plist.replace(regex, manifest[property]);
                }
                fs.writeFile('.mas/' + app_name + '/Contents/Info.plist', plist, {
                    encoding: 'utf8',
                    mode: stats.mode
                }, callback);
            },
            function(callback)
            {
                grunt.log.writeln('Updating helpers...');
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper.app');
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper EH.app');
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper NP.app');
                callback();
            },
            function(callback)
            {
                grunt.log.writeln('Installing app files...');
                exec('cp -r app.nw .mas/' + app_name + '/Contents/Resources', callback);
            },
            function(callback)
            {
                grunt.log.writeln('Cleaning built app...');
                exec('cd .mas/' + app_name + ' && find . -name "*.DS_Store" -type f -delete', callback);
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
        var series = [
            function(callback)
            {
                grunt.log.writeln('Signing node-webkit Helper.app...');
                exec(signCommand('assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper.app'), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing node-webkit Helper EH.app...');
                exec(signCommand('assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper EH.app'), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing node-webkit Helper NP.app...');
                exec(signCommand('assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper NP.app'), callback);
            },
            function(callback)
            {
                grunt.log.writeln('Signing app...');
                exec(signCommand('assets/entitlements/parent.plist', '.mas/' + app_name), callback);
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
        var command = 'cd .mas && productbuild --component "' + app_name + '" /Applications  --sign "' + identity + '" ' + app_name.replace('.app', '.pkg');
        exec(command, function(error, stdout, stderr)
        {
            grunt.log.writeln(stdout);
            done();
        });
    });

    /**
     * Gets a codesign command
     * @param entitlement_path
     * @param app_path
     */
    function signCommand(entitlement_path, app_path)
    {
        return 'codesign --deep -s ' + identity + ' -i ' + bundle_id + ' --entitlements ' + entitlement_path + ' "' + app_path + '"';
    }

    /**
     * Updates the Info.plist file of the needed helper app
     * @param helper_path
     */
    function updateHelperPlist(helper_path)
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