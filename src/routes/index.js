'use strict';

import express from 'express';
import api from './api';
import auth from '../lib/authentication';

let router = express.Router();

router.post('/ping', (reg, res) => {
    res.json('pong');
});

router.use('/api', auth.auth, api);

export default router;
