module.exports = function(grunt)
{

    'use strict';

    var async = require('async');
    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');
    var source_app = '/Applications/node-webkit.app';
    var app_name = 'namagic.app'; // No capital letters allowed ? Makes the app crash when signed

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec(source_app + 'app.nw');
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
                exec('rm -r .mas; mkdir .mas', function(error, stdout, stderr)
                {
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Creating empty application...');
                exec('cp -r ' + source_app + ' .mas/' + app_name, function(error, stdout, stderr)
                {
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Installing plist...');
                var plist = fillTemplate(fs.readFileSync('assets/plist/info.plist', {encoding: 'utf8'}), manifest);
                fs.writeFile('.mas/' + app_name + '/Contents/Info.plist', plist, {encoding: 'utf8'}, function(error)
                {
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Installing icon...');
                exec('cp assets/icns/icon.icns .mas/' + app_name + '/Contents/Resources/nw.icns', function(error, stdout, stderr)
                {
                    callback();
                });
            },
            function(callback)
            {
                grunt.log.writeln('Updating helpers...');
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper.app', manifest.bundle_identifier);
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper EH.app', manifest.bundle_identifier);
                updateHelperPlist('.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper NP.app', manifest.bundle_identifier);
                callback();
            },
            function(callback)
            {
                grunt.log.writeln('Installing app files...');
                exec('cp -r app.nw .mas/' + app_name + '/Contents/Resources', function(error, stdout, stderr)
                {
                    callback();
                });
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
        var identity = 'LK7U6U8DZ4' // @todo move this elsewhere
        var bundle_id = manifest.bundle_identifier;
        var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper.app');
        exec(command, function(error, stdout, stderr)
        {
            grunt.log.writeln(stdout);
            grunt.log.writeln(stderr);
            var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper EH.app');
            exec(command, function(error, stdout, stderr)
            {
                grunt.log.writeln(stdout);
                grunt.log.writeln(stderr);
                var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/node-webkit Helper NP.app');
                exec(command, function(error, stdout, stderr)
                {
                    grunt.log.writeln(stdout);
                    grunt.log.writeln(stderr);
                    var command = getSignCommand(identity, bundle_id, 'assets/entitlements/parent.plist', '.mas/' + app_name);
                    exec(command, function(error, stdout, stderr)
                    {
                        grunt.log.writeln(stdout);
                        grunt.log.writeln(stderr);
                        done();
                    });
                });
            });
        });
    });

    /**
     * Gets a codesign command
     * @param identity
     * @param bundle_id
     * @param entitlement_path
     * @param app_path
     */
    function getSignCommand(identity, bundle_id, entitlement_path, app_path)
    {
        return 'codesign --deep -s ' + identity + ' -i ' + bundle_id + ' --entitlements ' + entitlement_path + ' "' + app_path + '"';
    }

    /**
     * Updates the Info.plist file of the needed helper app
     * @param helper_path
     * @param bundle_id
     */
    function updateHelperPlist(helper_path, bundle_id)
    {
        var plist = fs.readFileSync(helper_path + '/Contents/Info.plist', {encoding: 'utf8'});
        plist = plist.replace(/<key>CFBundleIdentifier<\/key>[^\/]*\/string>/g, '<key>CFBundleIdentifier<\/key>\n	<string>' + bundle_id + '</string>');
        fs.writeFileSync(helper_path + '/Contents/Info.plist', plist, {encoding: 'utf8'});
    }

    /**
     * Fills a template file with an object
     */
    function fillTemplate(template, object)
    {
        for (var property in object)
        {
            var regex = new RegExp('{{' + property + '}}', 'g');
            template = template.replace(regex, object[property]);
        }
        return template;
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