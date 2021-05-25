import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { userModel } from '../models/user';
import { isLocal } from '../shared';
import bcryptjs from 'bcryptjs';
import urlParser from 'url';
import { Session } from '../session';

////
// Get Functions
////

export const get = {
  ///////////////////////////////////////////////////////////////////////////////////
  // GET Login
  ///////////////////////////////////////////////////////////////////////////////////
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Parses the URL.
    const url: urlParser.UrlWithParsedQuery = urlParser.parse (req.url, true);

    // Checks what error message to use.
    let error: string | null = null;
    if (url.query.error)
      switch (url.query.error) {
        case 'user_not_found':
          error = "Gebruiker niet gevonden!";  
          break;
        case 'missing_parameters':
          error = "Bepaalde gegevens ontbreken!";  
          break;
        case 'invalid_password':
          error = "Wachtwoord klopt niet!";  
          break;
      }

    // Renders the result page.
    res.render ('login.ejs', {
      error: error,
      url: req.originalUrl,
      redirect: url.query.redirect
    });
  },
  ///////////////////////////////////////////////////////////////////////////////////
  // GET Logout
  ///////////////////////////////////////////////////////////////////////////////////
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let session: Session = (<Session> (<any> req).u_session);

    // Parses the URL.
    const url: urlParser.UrlWithParsedQuery = urlParser.parse (req.url, true);

    // Only de-authenticate if we're actually authenticated.
    if (session.isAuthenticated ()) {
      session.deAuthenticateSession ();
      await session.save (res);
    }

    // Redirect to the login page.
    if (!url.query.redirect) res.redirect ('/login');
    else res.redirect (<string> url.query.redirect);
  }
};

////
// Post Functions
////

export const post = {
  ///////////////////////////////////////////////////////////////////////////////////
  // POST Register
  ///////////////////////////////////////////////////////////////////////////////////
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Checks if we're allowed to perform this operation.
    if (!isLocal (req.connection.remoteAddress)) {
      res.json ({
        sucess: false,
        error: 'Not authorized for operation!'
      });
      return;
    }

    // Performs the body validation.
    const errors = validationResult (req);
    if (!errors.isEmpty ()) {
      res.json ({
        status: false,
        error: 'Missing parameters',
        params: errors.array ()
      });
      return;
    }

    // Checks if the user noes not exist yet, if so send error.
    if (await userModel.findOne ({ $or: [ { username: req.body.username }, { email:req.body.email } ] })) {
      res.json ({
        status: false,
        error: 'Email or username already in use.'
      });
      return;
    }
 
    // Creates the new user model.
    const user = new userModel ({
      username: req.body.username,
      password: await bcryptjs.hash (req.body.password, await bcryptjs.genSalt (10)),
      birth_date: req.body.birth_date,
      creation_date: new Date (),
      full_name: req.body.full_name,
      email: req.body.email,
      type: req.body.type
    });

    // Saves the user in the database.
    await user.save ();

    // Sends the result to the client.
    res.json ({
      success:true,
      user
    });
  },
  ///////////////////////////////////////////////////////////////////////////////////
  // POST Login
  ///////////////////////////////////////////////////////////////////////////////////
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Performs the body validation.
    const errors = validationResult (req);
    if (!errors.isEmpty ()) {
      res.redirect ('/login?error=missing_parameters');
      return;
    }

    // Gets the params.
    const { username, password, redirect } = req.body;

    // Queries the database for the specified username.
    const user: any = await userModel.findOne ({
      $or: [
        {
          username
        },
        {
          email: username
        }
      ]
    });

    // Checks if there is an user, if not send an failure.
    if (!user) {
      res.redirect ('/login?error=user_not_found');
      return;
    }

    // Makes sure the passwords match.
    if (!(await bcryptjs.compare (password, user.password))) {
      res.redirect ('/login?error=invalid_password');
      return;
    }

    // Creates the session, and saves it to the client cookies or something.
    let sess: Session = (<Session> (<any> req).u_session);
    sess.authenticateSession (user._id);
    await sess.save (res);

    // Redirects the client to the main page.
    if (!redirect) res.redirect ('/panel');
    else res.redirect (redirect);
  }
};

