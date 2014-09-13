var util = require("util");

var Module = module.constructor;

function EmptyModule() {
	Module.apply(this, arguments);
}

util.inherits(EmptyModule, Module);

EmptyModule.prototype._cleanedObjectList = [
	"_", "process", "global", "exports", "module"
];

EmptyModule.prototype._compile = function(content, name) {
	return Module.prototype._compile.call(this,
		"var _ = undefined, process = undefined, global = undefined, exports = undefined, module = undefined;" +
		content, name);
};

exports.EmptyModule = EmptyModule;
