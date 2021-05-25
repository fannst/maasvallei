import express, { Request, NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { userModel, UserModel } from './models/user';

export const JWT_KEY: string = "AVerySecretMotherfuckingJWTKey_ILoveSchool";
export const JWT_EXPIRE: number = 60 * 60; // 1 Hour

export const AUTH_TOKEN_COOKIE: string = 'authToken';

export interface JWTContent {
    uid: string
}

export enum SessionState {
    Anonymous, Authenticated
}

export class SessionAuthentication {
    ///////////////////////////////////////////////////////////////////////////////////
    // Classy Stuff
    ///////////////////////////////////////////////////////////////////////////////////
    
    private _jwtContent: JWTContent;

    /**
     * Creates new authenticated session.
     * @param jwtContent the JWT content.
     */
    public constructor (jwtContent: JWTContent) {
        this._jwtContent = jwtContent;
    }

    public get jwtContent () {
        return this._jwtContent;
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    // Instance Methods
    ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Exports the current authenticated session to JWT token.
     * @returns the result token.
     */
    public toToken = async (): Promise<string> => {
        return new Promise<string> ((resolve, reject) => {
            jwt.sign ({
                data: this._jwtContent
            }, JWT_KEY, {
                expiresIn: JWT_EXPIRE
            }, (err, encoded) => {
                if (err) reject (err);
                resolve (<string> encoded);
            });
        })
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Static Methods
    ///////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Parses an authenticated session from JSON web token.
     * @param token the JWT token to parse.
     */
    public static fromToken = (token: string): SessionAuthentication => {
        const decoded: JWTContent = <JWTContent> ((<any> jwt.verify (token, JWT_KEY)).data);
    
        return new SessionAuthentication (decoded);
    };
}

export class Session {
    ///////////////////////////////////////////////////////////////////////////////////
    // Classy Stuff
    ///////////////////////////////////////////////////////////////////////////////////

    private static _AUTHENTICATION_CHANGE_BIT: number = (1 << 0);

    private _state: SessionState;
    private _authentication: SessionAuthentication | null;
    private _changeBits: number;
    private _user: UserModel | null;

    /**
     * Creates new Session class instance.
     * @param state the state of the session.
     * @param authentication the possible session authentication.
     */
    public constructor (state: SessionState, authentication: SessionAuthentication | null = null, user: UserModel | null = null) {
        this._state = state;
        this._authentication = authentication;
        this._user = user;
        this._changeBits = 0x00;
    }

    public get authentication () {
        return this._authentication;
    }

    public get state () {
        return this._state;
    }

    public get user () {
        return this._user;
    }

    public set user (user: UserModel | null) {
        this._user = user;
    }

    public isAuthenticated = (): boolean => this._authentication !== null;

    ///////////////////////////////////////////////////////////////////////////////////
    // Instance Methods
    ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Authenticates the session.
     * @param uid the id of the user.
     */
    public authenticateSession = (uid: mongoose.Types.ObjectId): void => {
        this._state = SessionState.Authenticated;
        this._changeBits |= Session._AUTHENTICATION_CHANGE_BIT;
        this._authentication = new SessionAuthentication ({
            uid: uid.toHexString ()
        });
    };

    /**
     * De-Authenticates the session.
     */
    public deAuthenticateSession = (): void => {
        this._state = SessionState.Anonymous;
        this._changeBits |= Session._AUTHENTICATION_CHANGE_BIT;
        this._authentication = null;
    };

    /**
     * Saves the current class to cookies or something, fuck this school... THIS IS BORING AS HELL!
     * @param res the response to save to.
     */
    public save = async (res: Response): Promise<void> => {
        if (this._changeBits & Session._AUTHENTICATION_CHANGE_BIT) {
            if (this._authentication === null) res.clearCookie (AUTH_TOKEN_COOKIE);
            else res.cookie (AUTH_TOKEN_COOKIE, await this._authentication?.toToken ());
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Static Methods
    ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Parses the session from an request.
     * @param req the request to parse cookies from.
     * @returns parsed session.
     */
    public static parse = async (req: Request): Promise<Session> => {
        let authentication: SessionAuthentication | null;
        let user: UserModel | null;
        let state: SessionState;

        // Attempts to parse the authentication token from the client.
        try {
            authentication = req.cookies[AUTH_TOKEN_COOKIE] ? 
                SessionAuthentication.fromToken (req.cookies[AUTH_TOKEN_COOKIE]) : null;
        } catch (e) {
            authentication = null;
        }

        // Attempts to get the user from the database, if the authentication is not null.
        user = authentication !== null ?
            <UserModel | null> await userModel.findOne ({
                _id: mongoose.Types.ObjectId.createFromHexString(authentication?.jwtContent.uid)
            }) : null;

        // Checks if there was any user found, if not set auth null.
        if (user === null)
            authentication = null;
        
        // Creates the session state type/
        state = authentication !== null ? SessionState.Authenticated : SessionState.Anonymous; 

        // Returns the Session instance.
        return new Session (state, authentication, user);
    };
}

/**
 * Gets called to load the session.
 * @param req the request.
 * @param res the response.
 * @param next the next function.
 */
export const pre = async (req: Request, res: Response, next: NextFunction) => {    
    (<Session> (<any> req).u_session) = await Session.parse (req);

    next ();
};
