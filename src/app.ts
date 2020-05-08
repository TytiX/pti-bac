import feathers from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import express from '@feathersjs/express';
import * as expressjs from 'express';
import socketio from '@feathersjs/socketio';

import { MessageService } from './services/message-service';
import { LobbyService } from './services/lobby-service';
import { UserService } from './services/user-service';
import { GameService } from './services/game-service';
import { CategoryService } from './services/category-service';

import { Datas } from './models/datas';

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Express middleware to parse HTTP JSON bodies
app.use(expressjs.json());
// Express middleware to parse URL-encoded params
app.use(expressjs.urlencoded({ extended: true }));
// Express middleware to to host static files from the current folder
app.use(expressjs.static('public'));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());

app.use('/messages', new MessageService());
const db = new Datas();
app.use('/categories', new CategoryService(db));
app.use('/games', new GameService(db, app));
app.use('/lobbies', new LobbyService(db, app));
app.use('/users', new UserService(db));

// Express middleware with a nicer error handler
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection: any) =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish((data: any) => app.channel('everybody'));

const port = process.env.PORT || 3030;
// Start the server
app.listen(port).on('listening', () =>
  console.log(`Feathers server listening on localhost:${port}`)
);

// create lobby "default"
app.service('lobbies').create({
  name: 'Default',
  categories: [
    {id: 0, name: 'Nom artiste'},
    {id: 1, name: 'Moyen de transport'},
    {id: 2, name: 'Plante'},
    {id: 3, name: 'Pays'}
  ],
  timer: 6 * 60 * 1000
});
