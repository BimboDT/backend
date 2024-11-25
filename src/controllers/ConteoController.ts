// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { Op, Model, Sequelize } from "sequelize";


interface Posicion {
    IdPos: number;
    Contado: boolean;
}


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
        this.router.get("/posicionesNoContadas/:idRack", this.getUncountedPositions.bind(this));
        this.router.get("/infoPosicion/:idPos", this.getLatestConteoForPosition.bind(this));
        this.router.post("/crearConteo", this.postCountingReport.bind(this));

        // Web App endpoints
        this.router.get("/numeroRacks/:ubi/:fechaConteo", this.getRackCompleteness.bind(this)); // 1° filter
        this.router.get("/numeroIncidencias/:ubi/:fechaConteo", this.getNumberOfIncidences.bind(this)); // 2° filter
        this.router.get("/numeroConteos/:ubi/:fechaConteo", this.getNumberOfCycleCountings.bind(this)); // 3° filter
        this.router.get("/productoDeUbicacion/:ubi", this.getProductByLocation.bind(this));
        this.router.get("/descripcionProducto/:prod", this.getDescriptionByName.bind(this));
        this.router.get("/incidenciasPorMes/:anio", this.getIncidenciaByMonth.bind(this)); // **
        this.router.get("/productosMasDiscrepancia", this.getMostDiscrepancyProductTop10.bind(this));
        this.router.get("/porcentajeAlmacen", this.getWarehouseCompleteness.bind(this));
        this.router.get("/top10Productos", this.getTop10Products.bind(this)); // **

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

    // Obtener posiciones no contadas
    private async getUncountedPositions(req: Request, res: Response) {
        try {

            const { idRack } = req.params;
            const letra = idRack.charAt(0);

            const uncountedPositions = await db.Posicion.findAll({
                where: {
                    Contado: false,
                    IdPos: {
                        [Op.like]: `${letra}%`,
                    },
                },
                attributes: ['IdPos'],
            });

            const positionsList = uncountedPositions.map((pos:Posicion) => pos.IdPos);

            res.status(200).json({ positions: positionsList });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error: ' + error);
        }
    }

    // Obtener valores más actuales para un IdPos
    private async getLatestConteoForPosition(req: Request, res: Response) {
        try {
            const { idPos } = req.params;

            const latestRecord = await db.Conteo.findOne({
                where: {
                    IdPos: idPos,
                },
                attributes: ['Pallets', 'CajasFisico', 'IdProducto'],
                order: [['FechaConteo', 'DESC']],
            });

            if (!latestRecord) {
                res.status(400).send('No se encontraron registros para IdPos')
            }

            res.status(200).json(latestRecord);
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error: ' + error);
        }
    }

    private async postCountingReport(req: Request, res: Response) {
        try {
            console.log(req.body);
            
            await db.Conteo.create(req.body);

            console.log("Reporte de conteo creado exitosamente");
            res.status(201).send("Reporte creado");
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error: " + err);
        }
    }


    // Function to get the completeness of the racks (1° filter)
    private async getRackCompleteness(req: Request, res: Response) {
        try {
            const { ubi, fechaConteo } = req.params;
    
            const completeness = await db.sequelize.query(
                `
                SELECT 
                    Rack.IdRack AS IdRack,
                    ROUND(((SUM(Conteo.CajasFisico) / Rack.Capacidad) * 8) / 10, 0) AS Completeness,
                    SUM(Conteo.CajasFisico) as SumaTotal
                FROM Conteo
                JOIN Rack ON LEFT(Conteo.IdPos, 1) = Rack.IdRack
                JOIN Posicion ON Conteo.IdPos = Posicion.IdPos
                WHERE Posicion.Ubicacion = :ubi AND Conteo.FechaConteo = :fechaConteo
                GROUP BY Rack.IdRack, Rack.Capacidad
                `,
                {
                    replacements: { ubi, fechaConteo },
                    type: db.Sequelize.QueryTypes.SELECT,
                }
            );
                
            res.status(200).json(completeness);
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error: " + err);
        }
    }

    // Function to get the number of incidences (2° filter)
    private async getNumberOfIncidences(req: Request, res: Response) {
        try {
            
            const { ubi, fechaConteo } = req.params;

            const incidencias = await db.sequelize.query(
                `
                SELECT COUNT(*) AS Incidencias, IdRack
                FROM Conteo
                INNER JOIN Posicion ON Conteo.IdPos = Posicion.IdPos
                WHERE Posicion.Ubicacion = :ubi
                    AND Conteo.FechaConteo = :fechaConteo
                    AND Conteo.CajasSistema != Conteo.CajasFisico
                GROUP BY IdRack;
                `,
                {
                    replacements: { ubi, fechaConteo },
                    type: db.Sequelize.QueryTypes.SELECT,
                }
            );

        res.status(200).json(incidencias);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }

    // Function to get the number of cycle countings (3° filter)
    private async getNumberOfCycleCountings(req: Request, res: Response) {
        try {
            const { ubi, fechaConteo } = req.params;
    
            // Obtener los racks dentro de la ubicación especificada
            const cycleCountings = await db.sequelize.query(
                `
                SELECT 
                    Rack.IdRack AS RackId,
                    (SELECT COUNT(*) 
                    FROM Posicion 
                    WHERE SUBSTRING(Posicion.IdPos, 1, 1) = Rack.IdRack
                    AND Posicion.Ubicacion = :ubi) AS TotalPositions,
                    COUNT(Conteo.IdConteo) AS CompletedCountings,
                    ROUND(
                        (COUNT(Conteo.IdConteo) * 8.0 / 
                        (SELECT COUNT(*) 
                        FROM Posicion 
                        WHERE SUBSTRING(Posicion.IdPos, 1, 1) = Rack.IdRack
                            AND Posicion.Ubicacion = :ubi)), 
                        0
                    ) AS CycleCountCompleteness
                FROM Conteo
                INNER JOIN Posicion ON Conteo.IdPos = Posicion.IdPos
                INNER JOIN Rack ON SUBSTRING(Conteo.IdPos, 1, 1) = Rack.IdRack
                WHERE Conteo.FechaConteo = :fechaConteo
                AND Posicion.Ubicacion = :ubi
                GROUP BY Rack.IdRack;
                `,
                {
                    replacements: { ubi, fechaConteo },
                    type: db.Sequelize.QueryTypes.SELECT,
                }
            );
    
            res.status(200).json(cycleCountings);
        } catch (error) {
            console.error(error);
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

        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }

    }


    private async getIncidenciaByMonth(req: Request, res: Response) {
        try {
            const { anio } = req.params;

            const incidenciasPorMes: { [key: string]: number } = {};
            
            for (let mes = 0; mes < 12; mes++) {
                const fechaInicio = new Date(parseInt(anio), mes, 1);
                const fechaFin = new Date(parseInt(anio), mes + 1, 0);
            
                // Convertir fechas a formato YYYY-MM-DD para trabajar con la fecha únicamente
                const inicioStr = fechaInicio.toISOString().split("T")[0];
                const finStr = fechaFin.toISOString().split("T")[0];
            
                const conteos = await db.Conteo.findAll({
                    where: {
                        [Op.and]: [
                            Sequelize.literal(`DATE(FechaConteo) >= '${inicioStr}'`),
                            Sequelize.literal(`DATE(FechaConteo) <= '${finStr}'`)
                        ]
                    },
                    raw: true // Opcional, mejora el rendimiento
                });
            
                const incidencias = conteos.reduce((count: any, conteo: any) => {
                    return conteo.CajasSistema !== conteo.CajasFisico ? count + 1 : count;
                }, 0);
            
                const nombreMes = fechaInicio.toLocaleString('es-ES', { month: 'long' });
                incidenciasPorMes[nombreMes] = incidencias;
            }
            
            res.status(200).json(incidenciasPorMes);            

        } catch (error: any) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }

    private async getMostDiscrepancyProductTop10(req: Request, res: Response) {
        try {
            // Obtener las incidencias agrupadas por producto
            const top10DiscrepancyProducts = await db.Conteo.findAll({
                include: [
                    {
                        model: db.Producto,
                        as: "Producto",
                        attributes: ["Nombre"] // Obtenemos solo el nombre del producto
                    }
                ],
                attributes: [
                    [Sequelize.col("Producto.Nombre"), "NombreProducto"], // Agrupamos por nombre del producto
                    [Sequelize.fn("SUM", Sequelize.literal("ABS(CajasFisico - CajasSistema)")), "TotalDiscrepancia"] // Calculamos la discrepancia total
                ],
                group: ["Producto.Nombre"], // Agrupamos por el nombre del producto
                order: [[Sequelize.literal("TotalDiscrepancia"), "DESC"]], // Ordenamos por discrepancia descendente
                limit: 10, // Limitar al top 10
                raw: false
            });
            
            const formattedResults = top10DiscrepancyProducts.map((product: any) => ({
                nombreProducto: product.get("NombreProducto"),
                totalDiscrepancia: product.get("TotalDiscrepancia")
            }));
            
            res.status(200).json(formattedResults);
            
            
        } catch (error: any) {
            console.log(error);
            res.status(500).send("Internal server error: " + error);
        }
    }

    private async getWarehouseCompleteness(req: Request, res: Response) {
        try {
            const totalCapacityResult = await db.Rack.findAll({
                attributes: [
                    [db.Sequelize.fn("SUM", db.Sequelize.col("Capacidad")), "TotalCapacity"]
                ],
                raw: true,
            });
    
            const totalCapacity = totalCapacityResult[0].TotalCapacity;
    
            const totalCajasFisicoResult = await db.Conteo.findAll({
                attributes: [
                    [db.Sequelize.fn("SUM", db.Sequelize.col("CajasFisico")), "TotalCajasFisico"]
                ],
                raw: true,
            });
    
            const totalCajasFisico = totalCajasFisicoResult[0].TotalCajasFisico;

            res.status(200).json({
                capacidadTotal: totalCapacity,
                ocupacionActual: totalCajasFisico
            });

        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error: " + error);
        }
    }

    private async getTop10Products(req: Request, res: Response) { 
        try {

            const top10ProductsByName = await db.Conteo.findAll({
                include: [
                    {
                        model: db.Producto,
                        as: "Producto", // Asegúrate de tener la relación configurada en el modelo
                        attributes: ["Nombre"] // Incluimos solo el nombre del producto
                    }
                ],
                attributes: [
                    [Sequelize.col("Producto.Nombre"), "NombreProducto"], // Agrupamos por nombre
                    [Sequelize.fn("SUM", Sequelize.col("CajasFisico")), "TotalCajasFisico"] // Sumamos la cantidad física
                ],
                group: ["Producto.Nombre"], // Agrupamos por el nombre del producto
                order: [[Sequelize.literal("TotalCajasFisico"), "DESC"]], // Ordenamos por cantidad total
                limit: 10, // Limitar al top 10
                raw: false // Esto permite acceder a las asociaciones correctamente
            });
            
            const formattedResults = top10ProductsByName.map((product: any) => ({
                nombreProducto: product.get("NombreProducto"), // Obtenemos el nombre desde la consulta
                totalCajasFisico: product.get("TotalCajasFisico") // Obtenemos la suma total
            }));
            
            res.status(200).json(formattedResults);

        } catch (error: any) { 
            console.error(error);
            res.status(500).send("Internal server error: " + error);
        }
    }
}

export default ConteoController;