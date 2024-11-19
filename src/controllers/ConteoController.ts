// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Model, Sequelize } from "sequelize";

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
        this.router.get("/obtenCajas/:ubi", this.getBoxesByLocation.bind(this));
        this.router.post("/crearConteo", this.postCountingReport.bind(this));
        this.router.put("/actualizarConteo", this.putCycleCounting.bind(this));

        // Web App endpoints
        this.router.get("/numeroRacks", this.getRackCompleteness.bind(this));
        this.router.get("/numeroIncidencias", this.getNumberOfIncidences.bind(this));
        this.router.get("/productoDeUbicacion/:ubi", this.getProductByLocation.bind(this));
        this.router.get("/descripcionProducto/:prod", this.getDescriptionByName.bind(this));
        this.router.get("/incidenciasPorMes/:mes", this.getIncidenciaByMonth.bind(this));
        this.router.get("/productoMasDiscrepancia", this.getMostDiscrepancyProduct.bind(this));

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

            const empleado = await db.Empleado.findOne({
                where: { NumEmpleado: numEmp },
            });

            if (empleado) {
                res.status(200).json(empleado["Nombre"]);
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
                where: { FechaConteo: fecha },
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
            
            await db.Conteo.create(req.body);

            console.log("Reporte de conteo creado exitosamente");
            res.status(201).send("<h1>Reporte creado</h1>");
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }

    private async getBoxesByLocation(req: Request, res: Response) {
        try {
            const { ubi } = req.params;

            const totalCajas = await db.Conteo.findAll({
                include: {
                    model: db.Posicion,
                    as: 'Posicion',
                    where: { Ubicacion: ubi },
                    attributes: [],
                },
                attributes: [[db.Sequelize.fn('SUM', db.Sequelize.col('CajasFisico')), 'TotalCajas']]
            });
            res.status(200).json(totalCajas[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }

    private async putCycleCounting(req: Request, res: Response) {
        try {
            const { IdPos, numEmp, valorNuevo } = req.body;

            await db.Conteo.update(
                { CajasFisico: valorNuevo },
                { where: { 
                    IdPos: IdPos,
                    NumEmpleado: numEmp 
                    }
                }
            );

            res.status(200).send("Conteo actualizado exitosamente");
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }

    // CHECARLO
    private async getRackCompleteness(req: Request, res: Response) {
        try {
            const { ubi, fechaConteo } = req.params;
    
            const completeness = await db.Conteo.findAll({
                include: {
                    model: db.Posicion,
                    as: 'Posicion',
                    where: { Ubicacion: ubi },
                    attributes: ['Capacidad']
                },
                where: { FechaConteo: fechaConteo },
                attributes: [
                    [db.Sequelize.literal(`ROUND((SUM(CajasFisico) / Posicion.Capacidad) * 8, 2)`), 'Completeness']
                ]
            });
    
            res.status(200).json(completeness[0]);
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }

    // Function to get the number of incidences
    private async getNumberOfIncidences(req: Request, res: Response) {
        try {
            const { ubi, fechaConteo } = req.params;

            const incidencias = await db.Conteo.count({
                include: {
                    model: db.Posicion,
                    as: 'Posicion',
                    where: { Ubicacion: ubi }
                },
                where: {
                    FechaConteo: fechaConteo,
                    CajasSistema: { [db.Sequelize.Op.ne]: db.Sequelize.col('CajasFisico') }
                }
            });
            
            res.status(200).json({ Incidencias: incidencias });

        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }

    }

    private async getProductByLocation(req: Request, res: Response) {
        try {
            const { ubi } = req.params;
        
            const conteos = await db.Conteo.findAll({
                include: {
                    model: db.Posicion,
                    as: 'Posicion',
                    where: { Ubicacion: ubi },
                    attributes: ['Ubicacion'] 
                },
                attributes: ['IdProducto']
            });
        
            const productosIds = conteos.map((conteo: any) => conteo.IdProducto);
        
            const productos = await db.Producto.findAll({
                where: { IdProducto: productosIds },
                attributes: ['IdProducto', 'Nombre']
            });
        
            const resultado = conteos.map((conteo: any) => {
                const producto = productos.find((p: any) => p.IdProducto === conteo.IdProducto);
                return {
                    Ubicacion: conteo.Posicion.Ubicacion,
                    Nombre: producto ? producto.Nombre : "Producto no encontrado"
                };
            });
        
            res.status(200).json(resultado);
        
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
        
    }

    private async getDescriptionByName(req: Request, res: Response) {
        try {
            const { prod } = req.params;

            const producto = await db.Producto.findOne({
                where: {Nombre: prod},
                attributes: ['Descripcion']
            })
            
            if (producto) {
                // res.status(200).json(producto["Descripcion"]);
                res.status(200).json(producto);

            } else {
                res.status(404).send("El empleado no existe");
            }

        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }

    }

    private async getIncidenciaByMonth(req: Request, res: Response) {
        try {
            const { mes } = req.params;

            const fechaInicio = new Date(mes);

            const anio = fechaInicio.getFullYear();
            const mesNumero = fechaInicio.getMonth() + 1; // Mes en JavaScript es 0-indexado

            const conteos = await db.Conteo.findAll({
                where: Sequelize.and(
                    Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("FechaConteo")), anio),
                    Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("FechaConteo")), mesNumero)
                )
            });

            const incidencias = conteos.reduce((count: any, conteo: any) => {
                return conteo.CajasSistema !== conteo.CajasFisico ? count + 1 : count;
            }, 0);

            res.status(200).json({ incidencias });

        } catch (error: any) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }

    private async getMostDiscrepancyProduct(req: Request, res: Response) {
        try {
            const conteos = await db.Conteo.findAll()

            res.status(200).json(conteos);

        } catch (error: any) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }


}

export default ConteoController;