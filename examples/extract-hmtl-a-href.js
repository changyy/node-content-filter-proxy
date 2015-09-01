var contentFilterProxy = require('..');
var cheerio = require('cheerio');

contentFilterProxy.createServer({
	'port' : 3128,
	'skip_no_handler_content': true,
	'handlers': [
		{
			'content-type': 'text/html',			// source content-type
			'handler': function(request, response){
				var output = {
					'content-type': 'text/html',	// output content-type
					'content': ''			// output content
				};
				console.log('request headers:'+JSON.stringify(request.headers));
				$ = cheerio.load(response);
				$('a').each(function(i, link){
					//console.log($(link).attr('href'));
					output['content'] += '<a href="'+$(link).attr('href')+'">'+$(link).text()+'<a/>\n';
				});
				return output;
			}
		}
	]
})
