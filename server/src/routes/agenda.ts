import express from 'express';
import { body } from 'express-validator';

import * as controller from '../controllers/agenda';

const router = express.Router ();

router.get ('/', controller.get.agenda);
router.get ('/schedule', controller.get.schedule);
router.get ('/complete/:id', controller.get.complete);
router.get ('/remove/:id', controller.get.remove);

router.post ('/schedule',
    body ('name').isString ().isLength ({ min: 1, max: 128 }),
    body ('date').isDate (),
    body ('time').isString (),
    body ('description').isString ().isLength ({ min: 0, max: 5000 }),
    controller.post.schedule);

export default router;
