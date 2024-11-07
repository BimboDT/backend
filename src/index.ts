// Authors: 
// * Víctor Adrián Sosa Hernández
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import Server from './provider/Server';
import {PORT,NODE_ENV} from './config';
import express from 'express';
import cors from 'cors';
import ConteoController from './controllers/ConteoController';
import ImageController from './controllers/ImageController';


// Creating a new Server instance with configuration options
const server = new Server({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers:[
        ConteoController.instance,
        ImageController.instance
    ]
});


// Extending the Express Request interface to include custom properties
declare global {
    namespace Express {
        interface Request {
            user: string;
            token: string;
        }
    }
}

// Initializing the server to start listening for requests
server.init();