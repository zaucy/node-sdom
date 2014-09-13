var util = require("util");

var Module = module.constructor;
var EmptyModule = require(__dirname + "/empty-module.js").EmptyModule;

function ImportableModule(imports, bCleanModule) {
	
	if(Object.prototype.toString.call(imports) !== '[object Array]' && typeof imports == "object") {
		this.imports = imports;
		if(typeof bCleanModule == "boolean") {
			this.clean = bCleanModule;
		}
	} else {
		this.imports = {};
		if(typeof imports == "boolean") {
			this.clean = imports;
		} else
		if(typeof bCleanModule == "boolean") {
			this.clean = bCleanModule;
		}
	}
	
	this.clean = this.clean || false;
	
	var args = Array.prototype.slice.call(arguments, 2).sort();
	
	if(this.clean) {
		EmptyModule.apply(this, args);
	} else {
		Module.apply(this, args);
	}
}

util.inherits(ImportableModule, EmptyModule);

ImportableModule.prototype._compile = function(content, name) {
	
	var editedContent = "var ";
	var bReplaceModule = false;
	
	for(var name in this.imports) {
		if(name != "console" && name != "module") {
			editedContent += name +"=module.imports."+name+",";
		} else
		if(name == "module") {
			bReplaceModule = true;
		}
	}
	
	
	if(editedContent.length > 4) {
		editedContent = editedContent.substr(0, editedContent.length-1) + ";";
		if(bReplaceModule) {
			editedContent += "var module=module.imports.module;";
		}
	} else {
		editedContent = "";
	}
	
	if(this.clean) {
		
		var cleanList = [];
		for(var i=0; EmptyModule.prototype._cleanedObjectList.length > i; i++) {
			var name = EmptyModule.prototype._cleanedObjectList[i];
			var match = false;
			for(var importName in this.imports) {
				if(importName == name) {
					match = true;
					break;
				}
			}
			
			if(!match) {
				cleanList.push(name);
			}
		}
		
		if(cleanList.length > 0) {
			editedContent += "var ";
			for(var i=0; cleanList.length > i; i++) {
				editedContent += cleanList[i] + "=undefined,";
			}
			editedContent = editedContent.substr(0, editedContent.length-1) + ";";
		}
		
		editedContent = editedContent + content;
		return Module.prototype._compile.call(this, editedContent, name);
	} else {
		editedContent = editedContent + content;
		return Module.prototype._compile.call(this, editedContent, name);
	}
};

module.exports.ImportableModule = ImportableModule;