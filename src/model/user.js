'use strict';

let bcrypt = require('bcrypt');
import Model from './model';
import _ from 'lodash';

export default class User extends Model{
    setPassword(plainPassword) {
        let salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(plainPassword, salt);
    }

    validatePassword(plainPassword) {
        return bcrypt.compareSync(plainPassword, this.password);
    }

    get allowedKeys() {
        return _.union(super.allowedKeys, ['password', 'username', 'name']);
    }
}
