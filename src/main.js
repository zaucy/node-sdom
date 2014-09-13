var jsdom = require("jsdom")
  , https = require("https")
	, http = require("http")
	, fs = require("fs")
	, util = require("util");

var EmptyModule = require(__dirname + "/empty-module.js").EmptyModule;
var ImportableModule = require(__dirname + "/importable-module.js").ImportableModule;
	
var defaultSettings = {
	
};

var clientScriptWrap = [
	"(function(){window.__sdomModuleExports=window.__sdomModuleExports||{};var module={exports:{}};document.currentScript.context=\"client\";(function(exports, module){for(var name in window.__sdomModuleExports) { eval(\"var \"+name+\"=window.__sdomModuleExports[\\\"\"+name+\"\\\"];\"); }",
	"}(module.exports, module)); for(var name in module.exports) { window.__sdomModuleExports[name] = module.exports[name]; } }());"
];

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

createNodeDOMServer.defaultSettings = function(settings) {
	for(var name in settings) {
		defaultSettings[name] = settings[name];
	}
};

createNodeDOMServer.__express = function(path, options, callback) {
	
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
					var script = scripts[i];
					var scriptContext = script.getAttribute("context");
					var scriptContent = script.src ? fs.readFileSync(options.settings["views"] + "/" + script.src) : script.textContent;
					
					if(scriptContext == "server"
					|| scriptContext == "server-client"
					|| scriptContext == "client-server") {
						
						window.module = module;
						window.exports = module.exports;
						
						var scriptModule = new ImportableModule(window, true);
						scriptModule._compile(scriptContent, null);
						
						
						
						if(scriptContext == "server") {
							script.parentElement.removeChild(script);
						} else {
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
				
				callback(null, "<!DOCTYPE html>\n" + document.getElementsByTagName("html")[0].outerHTML);
			}
		);
		
	});
	
};

module.exports = createNodeDOMServer;
