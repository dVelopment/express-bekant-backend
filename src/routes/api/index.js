'use strict';

'use strict';

import express from 'express';
let router = express.Router();

router.get('/keywords', function (req, res, next) {
    res.json({foo: 'bar'});
});

export default router;
