const url = require('url'),
    http = require('http'),
    nodeStatic = require('node-static'),
    httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  target: {
    host: 'localhost', // TODO: change were you want to proxy to
    port: 8080 // TODO: and set the port
  }
});

// TODO: change regex on which request you want to forward
const apiRegex = /^\/api\//;
const fileServer = new nodeStatic.Server('./public');

// create http server
const server = http.createServer(function (request, response) {

  // parse url for regex matching
  const url_parts = url.parse(request.url);

  proxy.on('error', function(e) {
    console.log(e)
  });
  if (apiRegex.test(url_parts.pathname)) {
    console.log('proxying');
    return proxy.proxyRequest(request, response);
  } else {
    console.log('statics')
    request.addListener('end', function () {
      fileServer.serve(request, response, function(err, result) {
        // respond with the index page if no route was found
        if (err && (err.status === 404)) {
          fileServer.serveFile('/index.html', 200, {}, request, response);
        }
      });
    }).resume();
  };

});

server.listen(8000);
