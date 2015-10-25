import app from './app';
import http from 'http';
import settings from './lib/settings';
import io from './lib/io';
import mdns from 'mdns';

let debug = require('debug')('bekant:server');
let config = settings.get('server');

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

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
    var addr = this.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);

    let name = config.name || 'bekant';

    // advertise via bonjour
    let ad = mdns.createAdvertisement(mdns.tcp('bekant'), addr.port, {
        txtRecord: {
            name: name
        },
        name: name
    });

    ad.start();
}

let port = normalizePort(config.port || '3000');
app.set('port', port);

/**
 * create HTTP server
 */
let server = http.createServer(app);

// setup socket.io
io.init(server);

// listen on provided port
server.listen(port, config.host || '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);
