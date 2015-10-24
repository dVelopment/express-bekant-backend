'use strict';

var settings = require('../../settings.json');

function getSetting(key) {
    var required = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    if (settings.hasOwnProperty(key)) {
        return settings[key];
    } else if (required === true) {
        throw new Error('no settings found for key "' + key + '" in settings.json');
    } else {
        return null;
    }
}

module.exports = {
    'get': getSetting
};