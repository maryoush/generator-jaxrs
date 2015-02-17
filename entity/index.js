'use strict';
var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base');


var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.useConfigurationFile =false;
    if (shelljs.test('-f', '.jaxrs.' + this.name + '.json')) {
        console.log(chalk.green('Found the .jaxrs.' + this.name + '.json configuration file, automatically generating the entity'));
        try {
            this.fileData = JSON.parse(this.readFileAsString('.jaxrs.' + this.name + '.json'))
        } catch (err) {
            console.log(chalk.red('The configuration file could not be read!'));
            return;
        }
        this.useConfigurationFile = true;
    }
    console.log(chalk.red('The entity for provided RAML will be created.'));
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.javaVersion = this.config.get('javaVersion');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');

    // Specific Entity sub-generator variables
    this.ramlUrl = null;

    //entities from RAML file
    this.entities = [];


};

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);


EntityGenerator.prototype.askForRaml = function askForRaml() {
    if (this.useConfigurationFile == true) {// don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();

    console.log(chalk.green('Generating POJO from RAML ...'));
    var prompts = [
        {
            type: 'input',
            name: 'ramlUrl',
            validate: function (input) {

                var request = require('sync-request'); // include request module

                try{
                         var response = request('GET',input);
                         console.log('result ok '+response);
                        return  true;

                }
                catch(e){
                        console.log('err '+response);
                        return 'Given url is not valid (reason : '+e+') ,  check it correctness !!';
                }

            },
            message: 'Provide your RAML url ?',
            default: 'https://api.yaas.io/configuration/v4/api-console/raml/api/configuration-service.raml'
                //'http://configuration-v4.test.cf.hybris.com/api-console/raml/api/configuration-service.raml'
        }
    ];
    this.prompt(prompts, function (props) {

        //console.log("Entering prompt ...."+JSON.stringify(props));

        if (props.ramlUrl != null) {

            var that = this;

            var index = 0;

            var newEntity  = {};

            processRaml(props.ramlUrl, function (propertyName,typeName){

                //console.log(" processing property ... \'"+propertyName+"\' type  \'"+typeName+"\'" );

                var field = {fieldId: index++,
                    fieldName: propertyName,
                    fieldType: typeName,
                    fieldNameCapitalized: _s.capitalize(propertyName),
                    fieldNameUnderscored: _s.underscored(propertyName)}

                newEntity.fieldNamesUnderscored.push(_s.underscored(propertyName));
                newEntity.fields.push(field);

                that.entities.push(newEntity);

                //console.log(" added entity "+that.entities.length);

            }, function (schemaName)
                {
                    newEntity = {
                        fieldNamesUnderscored  :  ['id'],
                        fields  : [],
                        name  : schemaName
                    };

                    //console.log(" processing schema \'"+schemaName+"\'" );
                    console.log(chalk.red('===========Processing schema '+schemaName+ '=============='));
                    if(index > 0 ) {
                        index = 0;
                    }
                }
            );

        }


             cb();
    }.bind(this));
};


EntityGenerator.prototype.files = function files() {

   // console.log("Generating files ... "+this.entities.length);


    //traverse for all entities
    for(var singleEntityIndex in this.entities){

        var singleEntity = this.entities[singleEntityIndex];

        //console.log("Generating file ... "+JSON.stringify(singleEntity));

        if (this.useConfigurationFile == false) { // store informations in a file for further use.
            this.data = {};
            this.data.fields = singleEntity.fields;
            this.data.fieldNamesUnderscored = singleEntity.fieldNamesUnderscored;

            this.data.changelogDate = this.changelogDate;
            var filename = '.jaxrs.' + singleEntity.name + '.json';
            this.write(filename, JSON.stringify(this.data, null, 4));
        } else {
            this.relationships = this.fileData.relationships;
            this.fields = this.fileData.fields;
            this.fieldNamesUnderscored = this.fileData.fieldNamesUnderscored;
            this.changelogDate = this.fileData.changelogDate;
        }

        //prepare generation context
        var ctx = {
            name : singleEntity.name,
            packageName : this.packageName,
            packageFolder : this.packageFolder,
            entityClass: _s.capitalize(singleEntity.name),
            entityInstance: singleEntity.name.charAt(0).toLowerCase() + singleEntity.name.slice(1),
            fields: singleEntity.fields,
            fieldNamesUnderscored: singleEntity.fieldNamesUnderscored
        };

        var insight = this.insight();
        insight.track('generator', 'entity');
        insight.track('entity/fields', singleEntity.fields.length);

        console.log("Rendering .... "+ctx.entityClass+" ..... ");

        render(this,ctx);


    }

    function render(that , ctx)
    {
        that.template('src/main/java/package/domain/_Entity.java',
            'src/main/java/' + ctx.packageFolder + '/domain/' + ctx.entityClass + '.java', ctx, {});

        that.template('src/main/java/package/repository/_EntityRepository.java',
            'src/main/java/' + ctx.packageFolder + '/repository/' + ctx.entityClass + 'Repository.java', ctx, {});

        that.template('src/main/java/package/web/rest/_EntityResource.java',
            'src/main/java/' + ctx.packageFolder + '/web/rest/' + ctx.entityClass + 'Resource.java', ctx, {});

        that.template('src/test/java/package/web/rest/_EntityResourceTest.java',
            'src/test/java/' + ctx.packageFolder + '/web/rest/' + ctx.entityClass + 'ResourceTest.java', ctx, {});
    }

};


function processRaml (ramlFileUrl,onField,onSchema){

    var raml = require('raml-parser');

    //'http://configuration-v4.test.cf.hybris.com/api-console/raml/api/configuration-service.raml'
    raml.loadFile(ramlFileUrl).then( function(data) {

         data.schemas.forEach(function (schemeEntry) {

                                    //nsole.log('loading schema -'+Object.keys(schemeEntry));
                                    Object.keys(schemeEntry).forEach(function (key){

                                        try
                                        {
                                            console.log('schema - '+key);
                                            var jsonObj =   JSON.parse(schemeEntry[key]);
                                            onSchema(key);
                                            if( jsonObj.type === 'object')
                                            {
                                                //or( propertyName in jsonObj.properties)
                                                Object.keys(jsonObj.properties).forEach(function (propertyName){
                                                {

                                                    if( jsonObj.properties[propertyName].hasOwnProperty('type'))
                                                    {
                                                        //console.log('  property '+propertyName+' type '+
                                                         //   jsonObj.properties[propertyName].type);
                                                        onField(propertyName,jsonObj.properties[propertyName].type);
                                                    }
                                                    else if(jsonObj.properties[propertyName].hasOwnProperty('oneOf'))
                                                    {
                                                        //console.log('  property '+propertyName+' type oneof ...');

                                                        onField(propertyName,'map');
                                                    }
                                                    else
                                                    {
                                                        //console.log('  property '+propertyName+' type unknown');
                                                        onField(propertyName,'object');
                                                    }
                                                }
                                                });
                                            }
                                            else if(jsonObj.type == 'array')
                                            {
                                                //console.log(' -- container --');
                                                onField(propertyName,'array');
                                            }
                                        //
                                        }
                                        catch(e)
                                        {
                                            console.error(e);
                                        }
                                    });
                            });

    }, function(error) {
        console.log('Error parsing RAML '+ramlFileUrl+': ' + error);
    });

}
