// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

// Define the ImageController class
class ImageController extends AbstractController {
    // Singleton
    // Class Attribute
    private static _instance: ImageController;
    // Class Method
    public static get instance(): AbstractController {
        if (!this._instance) {
            this._instance = new ImageController("image");
        }
        return this._instance;
    }

    // Define all the endpoints of the controller "ImageController"
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

export default ImageController;