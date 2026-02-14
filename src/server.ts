#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from './app';
// @ts-ignore
import createDebug from 'debug';
import http from 'http';
import { env } from './core/config/env';
import { getLocalIP } from './utils/network/getLocalIP';

const debug = createDebug('order-services-node:server');

/**
 * Get port from environment and store in Express.
 */

const host = getLocalIP()
const port = env.PORT;
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log(`
=======================================================================
Server running at http://${host}:${port}    
=======================================================================    
`);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
    debug('Listening on ' + bind);
}
