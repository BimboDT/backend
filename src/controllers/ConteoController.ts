// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

// Define the ConteoController class
class ConteoController extends AbstractController {
    // Singleton
    // Class Attribute
    public static _instance: ConteoController;
    // Class Method
    public static get instance(): AbstractController {
        if (!this._instance) {
            this._instance = new ConteoController("conteo");
        }
        return this._instance;
    }

    // Define all the endpoints of the controller "ConteoController"
    protected iniRoutes(): void {
        // Test endpoint
        this.router.get("/test", this.getTest.bind(this));
    }

    // Test endpoint
    private getTest(req: Request, res: Response) {
        try {
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>");
        } catch (error: any) {
         console.log(error);
         res.status(500).send("Internal server error" + error);
        }
    }
}

export default ConteoController;