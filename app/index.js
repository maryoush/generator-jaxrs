'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base'),
    packagejs = require(__dirname + '/../package.json');

var JaxrsGenerator = module.exports = function JaxrsGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({
            skipInstall: options['skip-install'],
            callback: this._injectDependenciesAndConstants.bind(this)
        });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JaxrsGenerator, yeoman.generators.Base);
util.inherits(JaxrsGenerator, scriptBase);


JaxrsGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    console.log(chalk.red('\n'+
            " ____                            ___             \n" +
            "/\\  _`\\   __                    /\\_ \\            \n" +
            "\\ \\,\\L\\_\\/\\_\\    ___ ___   _____\\//\\ \\      __   \n" +
            " \\/_\\__ \\\\/\\ \\ /' __` __`\\/\\ '__`\\\\ \\ \\   /'__`\\ \n" +
            "   /\\ \\L\\ \\ \\ \\/\\ \\/\\ \\/\\ \\ \\ \\L\\ \\\\_\\ \\_/\\  __/ \n" +
            "   \\ `\\____\\ \\_\\ \\_\\ \\_\\ \\_\\ \\ ,__//\\____\\ \\____\\\n" +
            "    \\/_____/\\/_/\\/_/\\/_/\\/_/\\ \\ \\/ \\/____/\\/____/\n" +
            "                             \\ \\_\\               \n" +
            "                              \\/_/               \n" +
            " _____                    ____    ____       \n" +
            "/\\___ \\                  /\\  _`\\ /\\  _`\\     \n" +
            "\\/__/\\ \\     __     __  _\\ \\ \\L\\ \\ \\,\\L\\_\\   \n" +
            "   _\\ \\ \\  /'__`\\  /\\ \\/'\\\\ \\ ,  /\\/_\\__ \\   \n" +
            "  /\\ \\_\\ \\/\\ \\L\\.\\_\\/>  </ \\ \\ \\\\ \\ /\\ \\L\\ \\ \n" +
            "  \\ \\____/\\ \\__/.\\_\\/\\_/\\_\\ \\ \\_\\ \\_\\ `\\____\\\n" +
            "   \\/___/  \\/__/\\/_/\\//\\/_/  \\/_/\\/ /\\/_____/\n" +
            "                                             \n" +
            "                                             \n" +
            "                                            __                   \n" +
            "                                           /\\ \\__                \n" +
            "   __      __    ___      __   _ __    __  \\ \\ ,_\\   ___   _ __  \n" +
            " /'_ `\\  /'__`\\/' _ `\\  /'__`\\/\\`'__\\/'__`\\ \\ \\ \\/  / __`\\/\\`'__\\\n" +
            "/\\ \\L\\ \\/\\  __//\\ \\/\\ \\/\\  __/\\ \\ \\//\\ \\L\\.\\_\\ \\ \\_/\\ \\L\\ \\ \\ \\/ \n" +
            "\\ \\____ \\ \\____\\ \\_\\ \\_\\ \\____\\\\ \\_\\\\ \\__/.\\_\\\\ \\__\\ \\____/\\ \\_\\ \n" +
            " \\/___L\\ \\/____/\\/_/\\/_/\\/____/ \\/_/ \\/__/\\/_/ \\/__/\\/___/  \\/_/ \n" +
            "   /\\____/                                                       \n" +
            "   \\_/__/                                                        \n"

    ));




    console.log('\nWelcome to the simple JaxRS generator\n');
    var insight = this.insight();

    var prompts = [
        {
            type: 'input',
            name: 'baseName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_-]*)$/.test(input)) return true;
                return 'Your application name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/4) What is the base name of your application?',
            default: 'sample-rest-api'

        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: '(2/4) What is your default Java package name?',
            default: 'com.hybris.app'
        },
        {
            type: 'list',
            name: 'javaVersion',
            message: '(3/4) Do you want to use Java 8?',
            choices: [
                {
                    value: '8',
                    name: 'Yes (use Java 8)'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'buildTool',
            message: '(4/4) Would you like to use Maven or Gradle for building the backend?',
            choices: [
                {
                    value: 'maven',
                    name: 'Maven (recommended)'
                }
            ],
            default: 'maven'
        }
    ];

    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.authenticationType = this.config.get('authenticationType');
    this.hibernateCache = this.config.get('hibernateCache');
    this.clusteredHttpSession = this.config.get('clusteredHttpSession');
   // this.websocket = this.config.get('websocket');
    this.databaseType = 'mongodb';//this.config.get('databaseType');
    this.javaVersion = this.config.get('javaVersion');
    this.buildTool = this.config.get('buildTool');
    //this.frontendBuilder = this.config.get('frontendBuilder');
    this.packagejs = packagejs;

    if (this.baseName != null &&
        this.packageName != null &&
        this.authenticationType != null &&
        this.hibernateCache != null &&
        this.clusteredHttpSession != null &&
       // this.websocket != null &&
        this.databaseType != null &&
        this.buildTool != null &&
        //this.frontendBuilder != null &&
        this.javaVersion != null) {

        console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
            'to re-generate the project...\n'));

        cb();
    } else {
        this.prompt(prompts, function (props) {
            if (props.insight !== undefined) {
                insight.optOut = !props.insight;
            }
            this.baseName = props.baseName;
            this.packageName = props.packageName;
            this.authenticationType = props.authenticationType;
            this.hibernateCache = props.hibernateCache;
            this.clusteredHttpSession = props.clusteredHttpSession;
           // this.websocket = props.websocket;
            this.databaseType = 'mongodb';
            this.buildTool = props.buildTool;
            //this.frontendBuilder = props.frontendBuilder;
            this.javaVersion = props.javaVersion;

            cb();
        }.bind(this));
    }
};

JaxrsGenerator.prototype.app = function app() {
    var insight = this.insight();
    insight.track('generator', 'app');
     var packageFolder = this.packageName.replace(/\./g, '/');
    var javaDir = 'src/main/java/' + packageFolder + '/';
    var resourceDir = 'src/main/resources/';

    // Create application
    this.template('_package.json', 'package.json', this, {});
   // this.template('_bower.json', 'bower.json', this, {});
    this.template('_README.md', 'README.md', this, {});
   // this.template('bowerrc', '.bowerrc', this, {});
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

    switch (this.buildTool) {
        case 'maven':
        default :
            this.template('_pom.xml', 'pom.xml', null, { 'interpolate': /<%=([\s\S]+?)%>/g });
    }

    // Create Java resource files
    this.mkdir(resourceDir);

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml', this, {});

    // Create Java files
    this.template('src/main/java/package/_Application.java', javaDir + '/Application.java', this, {});
    this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    this.mkdir(testDir);

    this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});

    this.config.set('baseName', this.baseName);
    this.config.set('packageName', this.packageName);
    this.config.set('packageFolder', packageFolder);
    this.config.set('authenticationType', this.authenticationType);
    this.config.set('hibernateCache', this.hibernateCache);
    this.config.set('clusteredHttpSession', this.clusteredHttpSession);
    this.config.set('databaseType', this.databaseType);
    this.config.set('buildTool', this.buildTool);
    this.config.set('javaVersion', this.javaVersion);
};

JaxrsGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
};

function removefile(file) {
    console.log('Remove the file - ' + file)
    if (shelljs.test('-f', file)) {
        shelljs.rm(file);
    }

}

function removefolder(folder) {
    console.log('Remove the folder - ' + folder)
    if (shelljs.test('-d', folder)) {
        shelljs.rm("-rf", folder);
    }
}

JaxrsGenerator.prototype._injectDependenciesAndConstants = function _injectDependenciesAndConstants() {
    if (this.options['skip-install']) {
        this.log(
            'After running `npm install & bower install`, inject your front end dependencies' +
            '\ninto your source code by running:' +
            '\n' +
            '\n' + chalk.yellow.bold('grunt wiredep') +
            '\n' +
            '\n ...and generate the Angular constants with:' +
            '\n' + chalk.yellow.bold('grunt ngconstant:dev')
        );
    }
};
