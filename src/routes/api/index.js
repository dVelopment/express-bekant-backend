'use strict';

import express from 'express';
import preferences from './preferences';

let router = express.Router();

router.use('/preferences', preferences);

export default router;
