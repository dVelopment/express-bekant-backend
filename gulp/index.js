'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    spawn = require('child_process').spawn,
    config = require('./config'),
    node;

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

gulp.task('build', ['scripts', 'views']);

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
