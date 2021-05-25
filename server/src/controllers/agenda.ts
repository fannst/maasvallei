import { Request, Response, NextFunction } from 'express';
import { Session } from '../session';
import moment from 'moment';
import mongoose from 'mongoose';
import { AgendaModel, agendaModel } from '../models/agenda';
import { validationResult } from 'express-validator';

////
// Get Functions
////

export const get = {
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Agenda
    ///////////////////////////////////////////////////////////////////////////////////
    agenda: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        if (!session.isAuthenticated ()) {
            res.redirect ('/login');
            return;
        }

        res.render ('agenda/agenda.ejs', {
            session: session,
            items: await agendaModel.find ({
                userID: session.user?._id
            }).sort ({ time: -1 })
        });
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Schedule
    ///////////////////////////////////////////////////////////////////////////////////
    schedule: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        if (!session.isAuthenticated ()) {
            res.redirect ('/login');
            return;
        }

        res.render ('agenda/schedule.ejs', {
            session: session
        });
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Complete
    ///////////////////////////////////////////////////////////////////////////////////
    complete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        if (!session.isAuthenticated ()) {
            res.redirect ('/login');
            return;
        }

        await agendaModel.updateOne ({
            _id: mongoose.Types.ObjectId.createFromHexString (req.params.id)
        }, {
            completed: true
        })

        res.redirect ('/agenda');
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Remove
    ///////////////////////////////////////////////////////////////////////////////////
    remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        if (!session.isAuthenticated ()) {
            res.redirect ('/login');
            return;
        }

        await agendaModel.deleteOne ({
            _id: mongoose.Types.ObjectId.createFromHexString (req.params.id)
        });

        res.redirect ('/agenda');
    }
};

////
// Post Functions
////

export const post = {
    ///////////////////////////////////////////////////////////////////////////////////
    // POST Schedule
    ///////////////////////////////////////////////////////////////////////////////////
    schedule: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        if (!session.isAuthenticated ()) res.redirect ('/login');

        // Performs the body validation.
        const errors = validationResult (req);
        if (!errors.isEmpty ()) {
            res.redirect ('/agenda/schedule?error=invalid_arguments');
            return;
        }

        // Gets the body.
        const { name, description, time, date } = req.body;

        // Creates the new model
        let model: mongoose.Document<AgendaModel> = new agendaModel ({
            time: moment (new Date (date)).add (time.split (':')[0], 'h').add (time.split (':')[1], 'm').toDate (),
            userID: session.user?._id,
            description: description,
            name: name,
            completed: false
        });

        // Saves the model and redirects.
        await model.save ();
        res.redirect ('/agenda');
    }
};

