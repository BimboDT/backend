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
    protected initRoutes(): void {
        // Test endpoint
        this.router.get("/test", this.getTest.bind(this));

        // Mobile App endpoints
        this.router.get("/consultaUsuario/:numEmp", this.getSpecificEmployee.bind(this));
        this.router.get("/consultaConteo/:fecha", this.getCycleCounting.bind(this));
        
        
        this.router.post("/crearConteo", this.postCountingReport.bind(this));
        // Web App endpoints


    }

    // {Test endpoint}
    private getTest(req: Request, res: Response) {
        try {
            console.log("Prueba exitosa");
            res.status(200).send("<h1>Prueba exitosa</h1>");
        } catch (error: any) {
         console.log(error);
         res.status(500).send("Internal server error" + error);
        }
    }


    // {Mobile App endpoints}
    // Function that queries an employee for their ID
    private async getSpecificEmployee(req: Request, res: Response) {
        try {
            const { numEmp } = req.params;

            const usuario = await db.Usuario.findOne({
                where: { NumEmpleado: numEmp },
            });

            if (usuario) {
                res.status(200).json(usuario);
            } else {
                res.status(404).send("El empleado no existe");
            }
        } catch (error: any) {
                console.log(error);
                res.status(500).send("Internal server error: " + error);
        }
    }

    private async getCycleCounting(req: Request, res: Response) {
        try {
            const { fecha } = req.params;

            const conteo = await db.Conteo.findAll({
                where: { Fecha: fecha },
            });

            if (conteo) {
                res.status(200).json(conteo);
            } else {
                res.status(404).send("No hay conteos para esta fecha");
            }
        } catch (error: any) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }


    private async postCountingReport(req: Request, res: Response) {
        try {
            console.log(req.body);
            const newCountingReport = await db.Conteo.create(req.body);

            console.log("Reporte de conteo creado exitosamente");
            res.status(201).send("<h1>Reporte creado</h1>");
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }
}

export default ConteoController;