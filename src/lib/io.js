'use strict';

import socketIo from 'socket.io';
import passportSocketIo from 'passport.socketio';
import session from './session';
import settings from './settings';
import cookieParser from 'cookie-parser';

let io;

function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');
    accept(); //Let the user through
}

function onAuthorizeFail(data, message, error, accept){
    if(error) accept(new Error(message));
    console.log('failed connection to socket.io:', message);
    accept(null, false);
}

function init(server) {
    if (io) {
        throw new Error('io.init already called');
    }

    io = socketIo(server);

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        secret: settings.get('session').secret,
        store: session.store,
        success: onAuthorizeSuccess,
        fail: onAuthorizeFail
    }));

    io.sockets.on('connection', function(socket) {
        console.log(socket.request.user);
    });
}

export default init;
