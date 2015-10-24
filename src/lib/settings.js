'use strict';

let settings = require('../../settings.json');

function getSetting(key, required = true) {
    if (settings.hasOwnProperty(key)) {
        return settings[key];
    } else if (required === true) {
        throw new Error(`no settings found for key "${key}" in settings.json`);
    } else {
        return null;
    }
}

module.exports = {
    'get': getSetting
};
