import express from 'express';
import { body } from 'express-validator';

import * as controller from '../controllers/complaints';

const router = express.Router ();

router.get ('/complain', controller.get.complain);
router.get ('/status/:id', controller.get.status);

router.post ('/complain',
    body ('name').isString ().isLength ({ min: 1, max: 128 }),
    body ('message').isString ().isLength ({ min: 1, max: 5000 }),
    body ('category').isNumeric ().toInt (),
    body ('priority').isNumeric ().toInt (),
    controller.post.complain);

export default router;
