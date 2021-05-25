import express from 'express';
import { body } from 'express-validator';

import * as controller from '../controllers/auth';

const router = express.Router ();

router.get ('/login', controller.get.login);
router.get ('/logout', controller.get.logout);

router.post ('/login', 
              body ('username').isString ().isLength({ min: 1, max: 128}),
              body ('password').isString ().isLength({ min: 1, max: 128}),
              controller.post.login);

router.post ('/register',
              body ('username').isString ().isLength ({ min: 1, max: 128}),
              body ('password').isString ().isLength({ min: 1, max: 128}),
              body ('birth_date').isISO8601 (),
              body ('full_name').isString ().isLength ({ min: 1, max: 128 }),
              body ('email').isEmail (),
              body ('type').isDecimal (),
              controller.post.register);

export default router;

