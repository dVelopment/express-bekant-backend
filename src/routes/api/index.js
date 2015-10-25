'use strict';

import express from 'express';
import users from './users';
import preferences from './preferences';

let router = express.Router();

router.use('/users', users);
router.use('/preferences', preferences);

export default router;
