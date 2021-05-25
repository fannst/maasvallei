import express, { NextFunction, Response, Request } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import * as session from './session';
import authRoute from './routes/auth';
import agendaRoute from './routes/agenda';

const app = express();

////
// Connects to the database and stuff.
////

mongoose.connect ('mongodb://localhost:27017/maasvallei', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

////
// Configures the app
////

app.use (bodyParser.urlencoded ({
  extended: false
}));
app.use (cookieParser ());
app.use (express.static (path.join (__dirname, '../../', 'static/dist')));

app.set ('view engine', 'ejs');
app.set ('views', path.join (__dirname, '../../', 'views'));

////
// Adds the routers to the app.
////

app.use (session.pre);

app.use ('/agenda', agendaRoute);
app.use ('/', authRoute);

app.get ('*', (req: Request, res: Response, next: NextFunction): void => {
  res.render ('404.ejs', {
    session: (<session.Session> (<any> req).u_session)
  });
});

////
// Listens the app
////

app.listen(80, '0.0.0.0', () => {
  console.log ('Express listening on port 80!');
});

