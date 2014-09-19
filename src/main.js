var jsdom = require("jsdom")
  , https = require("https")
	, http = require("http")
	, fs = require("fs")
	, util = require("util")
	, url = require("url")
	, Path = require("path");

var EmptyModule = require(__dirname + "/empty-module.js").EmptyModule;
var ImportableModule = require(__dirname + "/importable-module.js").ImportableModule;

var defaultSettings = {
	"content-folders": ["public"],
	"server-only": {
		"content-folders": ["private"]
	}
};

jsdom.defaultDocumentFeatures = {
	FetchExternalResources: ['link'],
	ProcessExternalResources: ['link']
};

var clientScriptWrap = [
	"(function(){window.__sdomModuleExports=window.__sdomModuleExports||{};var module={exports:{}};document.currentScript.context=\"client\";(function(exports, module){for(var name in window.__sdomModuleExports) { eval(\"var \"+name+\"=window.__sdomModuleExports[\\\"\"+name+\"\\\"];\"); }",
	"}(module.exports, module)); for(var name in module.exports) { window.__sdomModuleExports[name] = module.exports[name]; } }());"
];

function importTemplate(name) {
  fs.readFileSync(name);
}

function NodeDocumentObjectModelServer(options) {

}


NodeDocumentObjectModelServer.prototype.settings = defaultSettings;

NodeDocumentObjectModelServer.prototype.load = function(content, callback) {

};

function createNodeDOMServer(path, callback) {
	var domServer = new NodeDocumentObjectModelServer;

	if(!callback) {

	} else {

	}

	return domServer;
}

function changeDefaultSetting(name, value) {
	var defaultSetting = defaultSettings[name];
	var defaultSettingType = typeof defaultSetting;
	var newSetting = value;
	var newSettingType = typeof newSetting;
	
	if(defaultSettingType == "undefined") {
		console.warn("\""+name+"\" is not a sdom setting.");
	} else
	if(defaultSettingType == newSettingType) {
		defaultSettings[name] = newSetting;
	} else {
		throw "sdom setting \""+name+"\" type must be \""+defaultSettingType+"\" not \""+newSettingType+"\".";
	}
}

createNodeDOMServer.defaultSetting = function(name, value) {
	if(arguments.length == 0) {
		var setting = defaultSettings[name];
		if(typeof setting == "object") {
			return JSON.parse(JSON.stringify(setting));
		} else {
			return setting;
		}
	} else
	if(arguments.length == 2) {
		changeDefaultSetting(name, value);
	} else {
		throw "sdom.defaultSetting expects 0 or 2 arguments. "+arguments.length+" were provided.";
	}
};

createNodeDOMServer.defaultSettings = function() {
	switch(arguments.length) {
	case 0:
		return JSON.parse(JSON.stringify(defaultSettings));
	case 1:
		var settings = JSON.parse(JSON.stringify(arguments[0]));
		
		for(var name in settings) {
			changeDefaultSetting(name, settings[name]);
		}
		
		break;
	case 2:
		var settingName = arguments[0];
		var settingValue = argument[1];
		
		changeDefaultSetting(settingName, settingValue);
		
		break;
	default:
		throw "sdom.defaultSettings expects 0, 1, or 2 arguments. "+arguments.length+" was provided.";
	}
};

function processScriptTag(window, script, settings) {
	var document = window.document;
	var scriptContext = script.getAttribute("context");
	var scriptExt = "";
	var scriptContent = "";
	
	if(!script.src) {
		scriptContent = script.textContent;
	} else {
		
		if(scriptContext == "server") {
			var contentFolders = settings["server-only"]["content-folders"];
			var exists = false;
			for(var folderIndex in contentFolders) {
				var folder = contentFolders[folderIndex];
				exists = fs.existsSync(folder +  "/" + url.parse(script.src).pathname);
				if(exists) {
					scriptContent = fs.readFileSync(folder + "/" + url.parse(script.src).pathname);
					break;
				}
			}
		}
		
		if(!scriptContent) {
			var contentFolders = settings["content-folders"];
			var exists = false;
			for(var folderIndex in contentFolders) {
				var folder = contentFolders[folderIndex];
				exists = fs.existsSync(folder +  "/" + script.src);
				if(exists) {
					scriptContent = fs.readFileSync(folder + "/" + script.src);
					break;
				}
			}
		}
		
		if(!scriptContent) {
			console.warn("cannot find '"+script.src+"'");
			return;
		}
		
		scriptExt = Path.extname(url.parse(script.src).pathname);
	}
	
	if(scriptContext == "server"
	|| scriptContext == "server-client"
	|| scriptContext == "client-server") {

		window.module = module;
		window.exports = module.exports;
		window.include = importTemplate;

		var scriptModule = new ImportableModule(window, true);
		



		if(scriptContext == "server") {
			
			if(scriptExt) {
				
				if(scriptExt == ".html" || scriptExt == ".htm") {
					//script.insertAdjacentElement("afterend", scriptContent);
					
					/** @hack solution because insertAdjacentElement is not working. */
					var el = document.createElement("div");
					el.innerHTML = scriptContent;
					script.parentElement.insertBefore(el, script);
					
					var scripts = null;
					
					while((scripts=el.getElementsByTagName("script")).length > 0) {
						processScriptTag(window, scripts[0], settings);
					}
					
					while(el.childNodes.length > 0) {
						el.parentElement.insertBefore(el.firstChild, el);
					}
					
					el.parentElement.removeChild(el);
					
					/** @hack end */
					
					script.parentElement.removeChild(script);
					
				} else
				if(scriptExt == ".json") {
					var JSONdataQuery = url.parse(script.src, true).query;
					var JSONdata = JSON.parse(scriptContent);
					
					/** @hack again (see above hack) */
					var el = document.createElement("div");
					for(var name in JSONdataQuery) {
						
						if((name[0] == "\"" && name[name.length-1] == "\"") ||  (name[0] == "'" && name[name.length-1] == "'")) {
							el.appendChild(document.createTextNode(JSONdata[name]));
						} else {
							el.innerHTML += JSONdata[name].toString();
						}
					}
					
					script.parentElement.insertBefore(el, script);
					
					var scripts = el.getElementsByTagName("script");
					
					while((scripts=el.getElementsByTagName("script")).length > 0) {
						processScriptTag(window, scripts[0], settings);
					}
					
					while(el.childNodes.length > 0) {
						el.parentElement.insertBefore(el.firstChild, el);
					}
					
					el.parentElement.removeChild(el);
					
					
					
					/** @hack end */
					
					script.parentElement.removeChild(script);
				}
			} else {
				scriptModule._compile(scriptContent, null);
				script.parentElement.removeChild(script);
			}
			
		} else {
			scriptModule._compile(scriptContent, null);
			script.removeAttribute("context");
			script.textContent = "(function() {" + scriptContent + "}());";
		}

	} else
	if(!scriptContext || scriptContext == "client") {
		script.removeAttribute("context");

		if(scriptContext == "client") {
			script.removeAttribute("src");
			script.textContent = clientScriptWrap[0] + scriptContent + clientScriptWrap[1];
		}
	} else {
		throw "Invalid script context: '" + script.outerHTML + "'";
	}
}

createNodeDOMServer.__express = function(path, options, callback) {

  var importTemplate = function(name, callback) {
    createNodeDomServer.__express(name, options, function(err, html) {
      callback(err, html);
    });
  };
	
	var settings = options["sdom-settings"] || JSON.parse(JSON.stringify(defaultSettings));
	settings["server-only"]["content-folders"].push(options.settings.views);
	
	fs.readFile(path, function(err, data) {

		jsdom.env(
			data.toString(),
			function(errors, window) {
				if(errors) {
					callback(null, null);
					return;
				}

				var document = window.document;
				var scripts = document.getElementsByTagName("script");

				for(var i=0; scripts.length > i; i++) {
					processScriptTag(window, scripts[i], settings);
				}
				
				callback(null, "<!DOCTYPE html>\n" + document.getElementsByTagName("html")[0].outerHTML);
			}
		);

	});

};

module.exports = createNodeDOMServer;
