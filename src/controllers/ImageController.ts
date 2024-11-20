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
            this._instance = new ImageController("imagen");
        }
        return this._instance;
    }

    // Define all the endpoints of the controller "ImageController"
    protected initRoutes(): void {
        // Test endpoint
        this.router.get("/test", this.getTest.bind(this));

        this.router.get("/obtenDescProd/:rack", this.getProductInfo.bind(this));
        this.router.post("/subirImagenBD", this.uploadImage.bind(this));
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

      private async getProductInfo(req: Request, res: Response) {
        try {
          const { rack } = req.params;
  
          // Query para obtener los productos y su información de imagen
          const productInfo = await db.Conteo.findAll({
            include: [
                {
                    model: db.Posicion,
                    as: 'Posicion',
                    where: db.Sequelize.where(
                        db.Sequelize.literal(`SUBSTRING(Posicion.IdPos, 1, 1)`),
                        rack // Coincide la primera letra del IdPos con el rack solicitado
                    ),
                    attributes: [], // No necesitamos datos de Posicion en la respuesta
                },
                {
                    model: db.Producto,
                    as: 'Producto',
                    attributes: {exclude:['IdProducto', 'IdImagen']},
                    include: [
                        {
                            model: db.Imagen,
                            as: 'Imagen',
                            attributes: ['Url', 'Tipo'], // Campos de Imagen
                        },
                    ],
                },
            ],
            attributes: [], // No queremos datos de Conteo directamente
            raw: true, // Devolver como objetos planos
            nest: true, // Anidar resultados en objetos
          });
  
          // Formatear la respuesta para devolver solo la información relevante
          const formattedResponse = productInfo.map((item: any) => ({
            SKU: item.Producto.SKU,
            Nombre: item.Producto.Nombre,
            Categoria: item.Producto.Categoria,
            Descripcion: item.Producto.Descripcion,
            NormaEstiba: item.Producto.NormaEstiba,
            PiezasXCaja: item.Producto.PiezasXCaja,
            ImagenUrl: item.Producto.Imagen.Url,
            ImagenTipo: item.Producto.Imagen.Tipo,
        }));
  
          res.status(200).json(formattedResponse);
      } catch (error) {
          console.log(error);
          res.status(500).send('Internal server error: ' + error);
      }
      }


      private async uploadImage(req: Request, res: Response) {
        try {
          console.log(req.body);

          await db.Imagen.create(req.body);

          console.log("Imagen subida exitosamente");
          res.status(200).send("Imagen subida exitosamente");
        } catch (err) {
          console.log(err);
          res.status(500).send("Internal server error: " + err);
        }
      }
}

export default ImageController;