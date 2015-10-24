'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    spawn = require('child_process').spawn,
    config = require('./config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    node;

gulp.task('npm', function (done) {
    fs.exists(path.join(__dirname, '../settings.json'), function (exists) {
        if (!exists) {
            return done();
        }

        // install passport providers
        var settings = require('../settings.json');

        if (!settings.authentication || !settings.authentication.providers) {
            return done();
        }

        var providers = [];

        _.forEach(settings.authentication.providers, function(conf, provider) {
            providers.push('passport-' + provider);
        });

        if (!providers.length) {
            return done();
        }

        var proc = spawn('npm', ['install'].concat(providers), {stdio: 'inherit'});
        proc.on('close', function (code) {
            done();
        });
    });
});

gulp.task('scripts', function () {
    return gulp.src(config.scriptBase + '/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest(config.distBase));
});
gulp.task('views', function() {
    return gulp.src(config.scriptBase + '/**/*.jade')
        .pipe(gulp.dest(config.distBase));
});

gulp.task('server', ['build'], function () {
    if (node) {
        node.kill();
    }

    node = spawn('node', ['.'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            console.log('Error detected, waiting for changes ...');
        }
    });
});

gulp.task('watch', ['server'], function () {
    watch([config.scriptBase + '/**/*.js', 'package.json'], function () {
        gulp.start('server');
    });
});

gulp.task('build', ['scripts', 'views', 'npm']);

// cleanup on exit
function exitHandler(options, err) {
    if (options.cleanup) {
        console.log('clean');
        if (node) {
            node.kill();
        }
    }

    if (err) {
        console.log(err.stack);
    }

    if (options.exit) {
        process.exit();
    }
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
