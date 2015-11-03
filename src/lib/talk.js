'use strict';

import request from 'request';
import {spawn} from 'child_process';
import temp from 'temp';
import fs from 'fs';
temp.track();

function talk(position, language = 'de', cb) {
    if ('function' === typeof language) {
        cb = language;
        language = 'de';
    }
    let options = {
        url: 'https://translate.google.com/translate_tts',
        qs: {
            ie: 'UTF-8',
            q: position.label,
            tl: language,
            total: 1,
            idx: 0,
            textlen: position.label.length,
            tk: '162937|286006',
            client: 't'
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
            'Referer': 'https://translate.google.com/'
        }
    };

    temp.open({suffix: '.mp3'}, (err, info) => {
        if (err) {
            throw err;
        }
        request(options).pipe(fs.createWriteStream(info.path))
            .on('close', () => {
                let proc = spawn('mpg123', [info.path]);
                proc.on('close', function () {
                    temp.cleanup();
                    cb();
                });
            });
    });
}

export default talk;
