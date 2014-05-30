var 	http = require('http'),
	contentFilterProxy = require('./content-filter-proxy/');

module.exports = contentFilterProxy.Server;

module.exports.createContentFilterProxyServer =
module.exports.createContentFilterProxy =
module.exports.createProxyServer =
module.exports.createServer =
module.exports.createProxy = function createContentFilterProxyServer(options) {
	return new contentFilterProxy.Server(options);
};
