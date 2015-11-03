'use strict';

import express from 'express';
import api from './api';
import auth from '../lib/authentication';
import desk from './desk';

let router = express.Router();

router.post('/ping', (reg, res) => {
    res.json('pong');
});

router.use('/api', auth.auth, api);
router.use('/desk', desk);

export default router;
