module.exports = function(grunt)
{

    'use strict';

    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app.nw/package.json', {encoding: 'utf8'}) + ')');

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec('node_modules/nw/nwjs/nwjs.app/Contents/MacOS/nwjs app.nw');
        child.stdout.on('data', grunt.log.write);
        child.stderr.on('data', grunt.log.write);
        child.on('close', done);
    });

    /**
     * Builds the app
     */
    grunt.registerTask('build', function()
    {
        var app_name = manifest.name + '.app';
        var done = this.async();
        grunt.log.writeln('Cleaning...');
        setDevMode(false);
        exec('rm -r .mas; mkdir .mas', function(error, stdout, stderr)
        {
            grunt.log.writeln('Creating empty application...');
            exec('cp -r node_modules/nw/nwjs/nwjs.app .mas/' + app_name, function(error, stdout, stderr)
            {
                grunt.log.writeln('Installing icon...');
                exec('cp assets/icns/icon.icns .mas/' + app_name + '/Contents/Resources/nw.icns', function(error, stdout, stderr)
                {
                    grunt.log.writeln('Installing plist...');
                    var plist = fillTemplate(fs.readFileSync('assets/plist/info.plist', {encoding: 'utf8'}), manifest);
                    fs.writeFile('.mas/' + app_name + '/Contents/Info.plist', plist, function(error)
                    {
                        grunt.log.writeln('Installing app files...');
                        exec('cp -r app.nw .mas/' + app_name + '/Contents/Resources', function(error, stdout, stderr)
                        {
                            done();
                        });
                    });
                });
            });
        });
    });

    /**
     * Signs the app
     */
    grunt.registerTask('sign', function()
    {
        var app_name = manifest.name + '.app';
        var done = this.async();
        var identity = 'LK7U6U8DZ4' // @todo move this elsewhere
        var bundle_id = manifest.bundle_identifier;
        var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/nwjs Helper.app');
        exec(command, function(error, stdout, stderr)
        {
            grunt.log.writeln(stdout);
            grunt.log.writeln(stderr);
            var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/nwjs Helper EH.app');
            exec(command, function(error, stdout, stderr)
            {
                grunt.log.writeln(stdout);
                grunt.log.writeln(stderr);
                var command = getSignCommand(identity, bundle_id, 'assets/entitlements/child.plist', '.mas/' + app_name + '/Contents/Frameworks/nwjs Helper NP.app');
                exec(command, function(error, stdout, stderr)
                {
                    grunt.log.writeln(stdout);
                    grunt.log.writeln(stderr);
                    var command = getSignCommand(identity, bundle_id, 'assets/entitlements/parent.plist', '.mas/' + app_name + '');
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