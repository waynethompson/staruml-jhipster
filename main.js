define(function (require, exports, module) {
    "use strict";

    var AppInit             = app.getModule("utils/AppInit"),
        Repository          = app.getModule("core/Repository"),
        Engine              = app.getModule("engine/Engine"),
        Commands            = app.getModule("command/Commands"),
        CommandManager      = app.getModule("command/CommandManager"),
        MenuManager         = app.getModule("menu/MenuManager"),
        Dialogs             = app.getModule("dialogs/Dialogs"),
        ElementPickerDialog = app.getModule("dialogs/ElementPickerDialog"),
        FileSystem          = app.getModule("filesystem/FileSystem"),
        FileSystemError     = app.getModule("filesystem/FileSystemError"),
        ExtensionUtils      = app.getModule("utils/ExtensionUtils"),
        UML                 = app.getModule("uml/UML");
        
    var JdlGenerator = require("JdlGenerator"),
        JdlReverseEngineer = require("JdlReverseEngineer");

    // Handler for HelloWorld command
    function handleGenerate(base, path, options) {
        var result = new $.Deferred();

        // If options is not passed, get from preference
        //options = options || TypeScriptPreferences.getGenOptions();

        // If base is not assigned, popup ElementPicker
        if (!base) {
            ElementPickerDialog.showDialog("Select a base model to generate codes", null, type.UMLPackage)
                .done(function (buttonId, selected) {
                    if (buttonId === Dialogs.DIALOG_BTN_OK && selected) {
                        base = selected;

                        // If path is not assigned, popup Open Dialog to select a folder
                        if (!path) {
                            FileSystem.showOpenDialog(false, true, "Select a folder where generated codes to be located", null, null, function (err, files) {
                                if (!err) {
                                    if (files.length > 0) {
                                        path = files[0];
                                        JdlGenerator.generate(base, path, options).then(result.resolve, result.reject);
                                    } else {
                                        result.reject(FileSystem.USER_CANCELED);
                                    }
                                } else {
                                    result.reject(err);
                                }
                            });
                        } else {
                            JdlGenerator.generate(base, path, options).then(result.resolve, result.reject);
                        }
                    } else {
                        result.reject();
                    }
                });
        } else {
            // If path is not assigned, popup Open Dialog to select a folder
            if (!path) {
                FileSystem.showOpenDialog(false, true, "Select a folder where generated codes to be located", null, null, function (err, files) {
                    if (!err) {
                        if (files.length > 0) {
                            path = files[0];
                            JdlGenerator.generate(base, path, options).then(result.resolve, result.reject);
                        } else {
                            result.reject(FileSystem.USER_CANCELED);
                        }
                    } else {
                        result.reject(err);
                    }
                });
            } else {
                JdlGenerator.generate(base, path, options).then(result.resolve, result.reject);
            }
        }
        return result.promise();
    }
    
    function handleReverse() {
        window.alert("Not Implimented");
    }

    // Add a HelloWorld command
    var CMD_JHIPSTER = "jhipster",
        CMD_JHIPSTER_GENERATE = "jhipster.generate",
        CMD_JHIPSTER_REVERSE = "jhipster.reverse";
    
    CommandManager.register("jHipster",CMD_JHIPSTER, 
                            CommandManager.doNothing);   
    CommandManager.register("Generate JDL...", CMD_JHIPSTER_GENERATE, 
                            handleGenerate);
    CommandManager.register("Reverse Code...", CMD_JHIPSTER_REVERSE, 
                            handleReverse);
    
    // Add HelloWorld menu item (Tools > Hello World)
    var menu = MenuManager.getMenu(Commands.TOOLS);
    var menuItem = menu.addMenuItem(CMD_JHIPSTER);
    
    menuItem.addMenuItem(CMD_JHIPSTER_GENERATE);
    //menuItem.addMenuItem(CMD_JHIPSTER_REVERSE);

});