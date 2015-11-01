'use strict';

import Model from './model';
import _ from 'lodash';

export default class Preference extends Model {
    setUser(user) {
        this.userId = user._id;
    }

    get allowedKeys() {
        return _.union(super.allowedKeys, ['userId', 'position', 'label']);
    }
}
