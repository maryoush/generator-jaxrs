A Spring webservice Yeoman based generator based on http://jhipster.github.io/


# Installation
# Install needed packages (http://yeoman.io/codelab/setup.html,http://yeoman.io/authoring/)
```
npm install --global yo bower grunt-cli
```
# Install the jaxrs generator (see  http://jhipster.github.io) 
Go to the jaxrs-generator folder and run 
```
npm link
```
# Run the jaxrs generator
## Generate the app skeleton
Run the yo app in your target directory 
```
yo 
```
## Provide an entities for given RAML
* Run the entity generator
```
yo jaxrs:entity not-important
```
* Provide the RAML url or use default one....

(TODO)
# Run the app 
## Run the persistence - mongodb 
## Run the spring boot app
# Remove/uninstall plugin
```
npm uninstall -g generator-jaxrs
```
