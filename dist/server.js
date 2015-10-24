'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _libSettings = require('./lib/settings');

var _libSettings2 = _interopRequireDefault(_libSettings);

var _libIo = require('./lib/io');

var _libIo2 = _interopRequireDefault(_libIo);

var _mdns = require('mdns');

var _mdns2 = _interopRequireDefault(_mdns);

var debug = require('debug')('bekant:server');
var config = _libSettings2['default'].get('server');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);

    // advertise via bonjour
    var ad = _mdns2['default'].createAdvertisement(_mdns2['default'].tcp('http'), addr.port, { txtRecord: {
            name: 'bekant'
        } });

    ad.start();
}

var port = normalizePort(config.port || '3000');
_app2['default'].set('port', port);

/**
 * create HTTP server
 */
var server = _http2['default'].createServer(_app2['default']);

// setup socket.io
(0, _libIo2['default'])(server);

// listen on provided port
server.listen(port, config.host || '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);