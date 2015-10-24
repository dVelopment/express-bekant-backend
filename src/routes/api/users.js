'use strict';

import express from 'express';
import UserManager from '../../lib/userManager';

let router = express.Router();
let manager = new UserManager();

export default router;
