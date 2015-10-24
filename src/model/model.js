'use strict';

import _ from 'lodash';

export default class Model {
    constructor(data = {}) {
        let keys = this.allowedKeys;

        _.forEach(data, (val, key) => {
            if (_.find(keys, (k) => k === key)) {
                this[key] = val;
            }
        });
    }

    get allowedKeys() {
        return ['_id'];
    }
};
