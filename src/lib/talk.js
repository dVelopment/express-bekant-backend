'use strict';

import request from 'request';
import {spawn} from 'child_process';
import fs from 'fs';
import settings from './settings';
import path from 'path';

let dir = settings.get('talk').audioDir;

function talk(position, language = 'de', cb) {
    if ('function' === typeof language) {
        cb = language;
        language = 'de';
    }

    if (typeof cb !== 'function') {
        cb = function() {};
    }

    let audioFile = path.join(dir, position.label + '.mp3');

    let stat = fs.statSync(audioFile);
    if (stat.isFile() && stat.size) {
        let proc = spawn('mpg123', [audioFile]);
        proc.on('close', function () {
            cb();
        });
    } else {
        cb();
    }
}

export default talk;
