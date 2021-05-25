import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { ComplaintCategory, complaintModel, ComplaintModel, ComplaintStatus } from '../models/compaint';
import { Session } from '../session';

////
// Get Functions
////

export const get = {
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Complain
    ///////////////////////////////////////////////////////////////////////////////////
    complain: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);

        res.render ('complaints/complain.ejs', {
            url: req.originalUrl,
            session
        })
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // GET Status
    ///////////////////////////////////////////////////////////////////////////////////
    status: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let session: Session = (<Session> (<any> req).u_session);
        let complaint: any | null;

        try {
            complaint = await complaintModel.findOne ({
                _id: mongoose.Types.ObjectId.createFromHexString (req.params.id)
            });
        } catch (e) {
            complaint = null;
        }

        res.render ('complaints/status.ejs', {
            session,
            complaint,
            id: req.params.id,
            url: req.originalUrl
        });
    }
};

////
// Post Functions
////

export const post = {
    ///////////////////////////////////////////////////////////////////////////////////
    // POST Complain
    ///////////////////////////////////////////////////////////////////////////////////
    complain: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Performs the body validation.
        const errors = validationResult (req);
        if (!errors.isEmpty ()) {
            res.redirect ('/complaints/complain?error=invalid_arguments');
            return;
        }

        // Gets the body.
        const { name, message, category, priority } = req.body;

        // Creates the complaint.
        const complaint: mongoose.Document<ComplaintModel> = new complaintModel ({
            name, message,
            category: parseInt (category),
            priority: parseInt(priority),
            status: ComplaintStatus.Open,
            claim: null,
            date: new Date ()
        });

        // Stores the complaint.
        await complaint.save ();

        // Redirects to the complaint status.
        res.redirect (`/complaints/status/${complaint._id}`)
    }
};

