var	net = require('net'),
	url = require('url'),
	sys = require('sys'),
	http = require('http'),
	contentFilterProxy = exports;

exports.Server = createContentFilterProxyServer;

function createContentFilterProxyServer(options) {
	var server = http.createServer(function(request, response) {
		var findPathAt = request.url.indexOf(request.headers['host']);
		var findPortAt = request.headers['host'].indexOf(':');
		var targetHost = findPortAt >= 0 ? request.headers['host'].substring(0, findPortAt ) : request.headers['host'];
		var targetPort = findPortAt >= 0 ? parseInt(request.headers['host'].substring(findPortAt+1)) : 80;
		var targetPath = findPathAt > 0 ? request.url.substring(findPathAt+request.headers['host'].length) : request.url;
		sys.log(request.connection.remoteAddress + "\tHTTP\t" + request.method + "\t[" +  targetHost + "]["+targetPort+"]\t"+ targetPath);
		var proxyRequest = http.request({
			host: request.headers['host'],
			port: targetPort,
			method: request.method, 
			path: targetPath,
			headers: request.headers
		});
		proxyRequest.addListener('response', function (proxyResponse) {
			//sys.log(JSON.stringify(proxyResponse.headers));
			//sys.log((proxyResponse.headers));

			// Step 1: content-type checking
			if(!proxyResponse.headers['content-type']) {
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.end("The requested file type is not supported");
				return;
			}

			// Step 2: choose handler
			var handlerIndex = -1;
			if(options['handlers'] instanceof Array) {
				for(var i=0; i<options['handlers'].length; ++i) {
					if(options['handlers'][i]['content-type'] == proxyResponse.headers['content-type'].substr(0, options['handlers'][i]['content-type'].length) ) {
						handlerIndex = i;
						break;
					}
				}
			}
			if(handlerIndex != -1) {
				var handler = options['handlers'][handlerIndex]['handler'];
				var raw = '';
				proxyResponse.addListener('data', function(chunk) {
					raw += chunk;
				});
				proxyResponse.addListener('end', function() {
					var result = handler(raw);
					proxyResponse.headers['content-type'] = result['content-type'] || 'text/plain';
					proxyResponse.headers['content-length'] = result['content'].length || 0;
					response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
					response.write(result['content'],'binary');
					response.end();
				});
			} else if(options['skip_no_handler_content']) {
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.end("The requested file type is not supported");
			} else {
				proxyResponse.addListener('data', function(chunk) {
					response.write(chunk, 'binary');
				});
				proxyResponse.addListener('end', function() {
					response.end();
				});
				response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			}
		});
	
		request.addListener('data', function(chunk) {
			proxyRequest.write(chunk, 'binary');
		});
	
		request.addListener('end', function() {
			proxyRequest.end();
		});
	}).listen(options['port'] || 8000, function(){
		sys.log('Service Running at ' + (options['port'] || 8000) + ' Port' );
	});

	// https usage
	server.addListener( 'connect', function (request, socket, head) {
		var targetUrl = request['url'];
		var findPortAt = request['url'].indexOf(':');
		var targetHttpVersion = request['httpVersion'];
		var targetHost = findPortAt >= 0 ? request['url'].substring(0, findPortAt ) : request['url'];
		var targetPort = findPortAt >= 0 ? parseInt(request['url'].substring(findPortAt+1)) : 443;
		sys.log(socket.remoteAddress + "\tHTTPS\t" + "" + " [" + targetHost + "]["+targetPort+"] "+request['url'] );

		var proxyUsage = new net.Socket();
		proxyUsage.connect(targetPort, targetHost, function(){
			//proxyUsage.write(head);
			socket.write("HTTP/"+targetHttpVersion+" 200 Connection established\r\n\r\n");
		});
		proxyUsage.on('error', function (err) {
			socket.write("HTTP/"+targetHttpVersion+ " 500 Connection error\r\n\r\n");
			socket.end();
		});
		proxyUsage.on('data', function (chunk) {
			socket.write(chunk);
		});
		proxyUsage.on('end', function () {
			socket.end();
		});

		socket.on('data', function (chunk) {
			proxyUsage.write(chunk);
		});
		socket.on('end', function () {
			proxyUsage.end();
		});
		socket.on('error', function () {
			proxyUsage.end();
		});
	});
}
