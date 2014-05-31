var	http = require('http'),
	contentFilterProxy = exports;

exports.Server = createContentFilterProxyServer;

function createContentFilterProxyServer(options) {
	http.createServer(function(request, response) {
		if(options['log'])
			console.log(request.connection.remoteAddress + ": " + request.method + " [" + request.headers['host'] + "] "+ request.url);
		var findPathAt = request.url.indexOf(request.headers['host']);
		var proxyRequest = http.request({
			port: 80,
			host: request.headers['host'],
			method: request.method, 
			path: findPathAt > 0 ? request.url.substring(findPathAt+request.headers['host'].length) : request.url,
			headers: request.headers
		});
		proxyRequest.addListener('response', function (proxyResponse) {
			//console.log(JSON.stringify(proxyResponse.headers));
			//console.log((proxyResponse.headers));

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
		console.log('Service Running at ' + (options['port'] || 8000) + ' Port' );
	});
}
