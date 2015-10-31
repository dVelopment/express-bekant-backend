'use strict';

import Model from './model';
import _ from 'lodash';
import uuid from 'node-uuid';

export default class ApiKey extends Model {
    setUser(user) {
        this.userId = user._id;
    }

    createApiKey() {
        this.apiKey = uuid.v1();
    }

    get allowedKeys() {
        return _.union(super.allowedKeys, ['userId', 'expires', 'apiKey']);
    }
}
