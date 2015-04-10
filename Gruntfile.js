module.exports = function(grunt)
{

    'use strict';

    var exec = require('child_process').exec;
    var fs = require('fs');
    var manifest = eval('(' + fs.readFileSync('app/package.json', {encoding: 'utf8'}) + ')');

    /**
     * Runs the app
     * Use the "--dev" option to enable toolbars and debug
     */
    grunt.registerTask('run', function()
    {
        setDevMode(grunt.option('dev') === true);
        var done = this.async();
        var child = exec('node_modules/nw/nwjs/nwjs.app/Contents/MacOS/nwjs app');
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
        grunt.log.writeln('Cleaning...');
        exec('rm -r macappstore/nwjs.app', function(error, stdout, stderr)
        {
            grunt.log.writeln('Copying empty application...');
            exec('cp -r node_modules/nw/nwjs/nwjs.app macappstore', function(error, stdout, stderr)
            {
                grunt.log.writeln('Installing icon...');
                exec('cp assets/icns/icon.icns macappstore/nwjs.app/Contents/Resources/nw.icns', function(error, stdout, stderr)
                {
                    grunt.log.writeln('Installing plist...');
                    var plist = fillTemplate(fs.readFileSync('assets/plist/info.plist', {encoding: 'utf8'}), manifest);
                    fs.writeFile('macappstore/nwjs.app/Contents/Info.plist', plist, function(error)
                    {
                        done();
                    });
                });
            });
        });
    });

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
        grunt.file.write('./app/.dev', enable ? '1' : '0', {encoding: 'utf8'});
    }

};