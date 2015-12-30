define(function (require, exports, module) {
    "use strict";
    
    var Repository     = app.getModule("core/Repository"),
        ProjectManager = app.getModule("engine/ProjectManager"),
        Engine         = app.getModule("engine/Engine"),
        FileSystem     = app.getModule("filesystem/FileSystem"),
        FileUtils      = app.getModule("file/FileUtils"),
        Async          = app.getModule("utils/Async"),
        UML            = app.getModule("uml/UML");        
        
    var CodeGenUtils = require("CodeGenUtils");
    
    var outputFilename = "entities.jh";
    var outputString = "";
    var codeWriter = new CodeGenUtils.CodeWriter("    ");
     /**
     * JDL Generator
     * @constructor
     *
     * @param {type.UMLPackage} baseModel
     * @param {string} basePath generated files and directories to be placed
     */
    function JdlGenerator(baseModel, basePath) {

        /** @member {type.Model} */
        this.baseModel = baseModel;

        /** @member {string} */
        this.basePath = basePath;
    }

    /**
     * Generate codes from a given element
     * @param {type.Model} elem
     * @param {string} path
     * @param {Object} options
     * @return {$.Promise}
     */
    JdlGenerator.prototype.generate = function (elem, path, options) {
        var result = new $.Deferred(),
            self = this;
            
        var isAnnotationType = elem.stereotype === "annotationType";

        // Package
        if (elem instanceof type.UMLPackage) {
            //
            console.log(elem.ownedElements);
            
            for(var i = 0; i < elem.ownedElements.length; i++){
                self.generate(elem.ownedElements[i], path, options);
            }
            
            console.log("Ready to write data");
            console.log(codeWriter.getData());
            
            var file = FileSystem.getFileForPath(path + "/" + outputFilename);
            FileUtils.writeText(file, codeWriter.getData(), true)
                     .then(result.resolve, result.reject);
                     
  /*
            Async.doSequentially(
                        elem.ownedElements,
                        function (child) {
                            console.log('package generate');
                            return self.generate(child, path, options);
                        },
                        false
                    ).then(function(){
                        console.log("Ready to get data");
                        console.log(codeWriter.getData());
                         FileUtils.writeText(path + "/" + outputFilename, codeWriter.getData(), true)
                                  .then(result.resolve, result.reject);
                        }, result.reject);
                    */
        } else if (elem instanceof type.UMLClass) {
            // AnnotationType
            if (isAnnotationType) {
                console.log('annotationType generate');
/*
                console.log(elem.name.substring(elem.name.length - 9, elem.name.length));

                if (elem.name.length < 9) {
                    elem.name = elem.name + "Attribute";
                } else if (elem.name.substring(elem.name.length - 9, elem.name.length) !== "Attribute") {
                    elem.name = elem.name + "Attribute";
                }

                fullPath = path + "/" + elem.name + ".ts";
                codeWriter = new CodeGenUtils.CodeWriter(this.getIndentString(options));
                codeWriter.writeLine();
//                this.writeAnnotationType(codeWriter, elem, options, isAnnotationType);
                this.writeNamespace("writeAnnotationType", codeWriter, elem, options, isAnnotationType);
                file = FileSystem.getFileForPath(fullPath);
                FileUtils.writeText(file, codeWriter.getData(), true).then(result.resolve, result.reject);
                */
            } else {
                // Class
                console.log('Class generate ' + elem.name);                
                codeWriter.writeLine();
                this.writeClass(codeWriter, elem, options, isAnnotationType);
            }
        } else if (elem instanceof type.UMLEnumeration) {
        // Enum
            codeWriter.writeLine();
            this.writeEnum(codeWriter, elem, options);
        } else {
        // Others (Nothing generated.)
            console.log('nothing generate');
            result.resolve();
        }
        return result.promise();
    };

    /**
     * Write Class
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeClass = function (codeWriter, elem, options) {
        var i, len, terms = [];

        // Class
        var name = elem.name.charAt(0).toUpperCase() + elem.name.slice(1);
        codeWriter.writeLine("entity " + name + " {");
        codeWriter.indent();

        // Member Variables
        // (from attributes)
        for (i = 0, len = elem.attributes.length; i < len; i++) {
            this.writeMemberVariable(codeWriter, elem.attributes[i], options);
            codeWriter.writeLine();
        }
        // (from associations)
        var associations = Repository.getRelationshipsOf(elem, function (rel) {
            return (rel instanceof type.UMLAssociation);
        });

        console.log('association length: ' + associations.length);

        for (i = 0, len = associations.length; i < len; i++) {
            var asso = associations[i];
            if (asso.end1.reference === elem && asso.end2.navigable === true) {
                this.writeMemberVariable(codeWriter, asso.end2, options);
                codeWriter.writeLine();
                console.log('assoc end1');
            } else if (asso.end2.reference === elem && asso.end1.navigable === true) {
                this.writeMemberVariable(codeWriter, asso.end1, options);
                codeWriter.writeLine();
                console.log('assoc end2');
            }
        }

        codeWriter.outdent();
        codeWriter.writeLine("}");
    };

    /**
     * Return type expression
     * @param {type.Model} elem
     * @return {string}
     */
    JdlGenerator.prototype.getType = function (elem) {
        var allowedTypes = ["Integer","Long","Float","Double","BigDecimal","LocalDate","ZonedDateTime","Boolean","enum","byte[]"];
        var _type = "String";
        // type name
        if (elem instanceof type.UMLAssociationEnd) {
            if (elem.reference instanceof type.UMLModelElement && elem.reference.name.length > 0) {
                _type = elem.reference.name;
            }
        } else {
            if (elem.type instanceof type.UMLModelElement && elem.type.name.length > 0) {
                _type = elem.type.name;
            } else if (_.isString(elem.type) && elem.type.length > 0) {
                _type = elem.type;
            }
        }    
        return _type;
    };
    
        /**
     * Write Member Variable
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */

    JdlGenerator.prototype.writeMemberVariable = function (codeWriter, elem, options) {
        if (elem.name.length > 0) {
            var terms = [];          
          
            // name
            terms.push(elem.name);
			
			// type
			terms.push(this.getType(elem));
			
            // TODO - Add options here
            
            codeWriter.writeLine(terms.join(" ") + ",");
        }
    };
    
    
    /**
     * Write Enum
     * @param {StringWriter} codeWriter
     * @param {type.Model} elem
     * @param {Object} options
     */
    JdlGenerator.prototype.writeEnum = function (codeWriter, elem, options) {
        var i, len;

        codeWriter.writeLine("enum "+ elem.name + " {");
        codeWriter.indent();

        // Literals
        for (i = 0, len = elem.literals.length; i < len; i++) {
            codeWriter.writeLine(elem.literals[i].name.toUpperCase() + (i < elem.literals.length - 1 ? "," : ""));
        }

        codeWriter.outdent();
        codeWriter.writeLine("}");
    };


    
    /**
     * Generate
     * @param {type.Model} baseModel
     * @param {string} basePath
     * @param {Object} options
     */
    function generate(baseModel, basePath, options) {
        var result = new $.Deferred();
        var jdlGen = new JdlGenerator(baseModel, basePath);
        return jdlGen.generate(baseModel, basePath, options);
    }

    exports.generate = generate;  
    
});