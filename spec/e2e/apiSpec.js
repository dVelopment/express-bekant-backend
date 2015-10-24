'use strict';

var request = require('request');
var settings = require('../../dist/settings');
var config = settings.get('server');

describe('The API', function () {
    it('should respond to a GET request at /api/keywords/', function (done) {
        request.get({
            url: 'http://127.0.0.1:' + config.port + '/api/keywords/',
            json: true
        }, function (err, res, body) {
            expect(res.statusCode).toBe(200);
            expect(body.foo).toEqual('bar');
            done();
        });
    });
});
