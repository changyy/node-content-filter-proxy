(function(exports) {
	var contentFilterProxy = require(__dirname+'/lib/http-https.js');
	
	exports.createServer =
	exports.createProxy = function createContentFilterProxyServer(options) {
		return new contentFilterProxy.Server(options);
	}
})(typeof exports !== "undefined" ? exports : this);
