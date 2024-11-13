// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Enum for the category of the product
enum ProdCategory {
    Barra = 'Barra',
    Dona = 'Dona',
    Galleta = 'Galleta',
    PanCaja= 'PanCaja',
    PanDulce = 'PanDulce',
    Panque = 'Panque',
    Rol = 'Rol',
    Granola = 'Granola',
}

// Interface for the Product Model
interface ProductAttributes {
    IdProducto: number;
    SKU: string;
    Nombre: string;
    Categoria: ProdCategory;
    Descripcion: string;
    NormaEstiba: string;
    PiezasXCaja: number;
}

// Define the Product Model, for the Sequelize ORM, representing a product in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Producto
        extends Model<ProductAttributes>
        implements ProductAttributes
        {
            // Attributes are enforced by the ProductAttributes interface
            public IdProducto!: number;
            public SKU!: string;
            public Nombre!: string;
            public Categoria!: ProdCategory;
            public Descripcion!: string;
            public NormaEstiba!: string;
            public PiezasXCaja!: number;

            // Associates the Producto model with other models
            static associate(models: any) {
                Producto.belongsTo(models.Imagen, {
                    foreignKey: 'IdImagen',
                    as: 'Imagen',
                });
            }
        }

        // Initializes the Producto model with its attributes and options
        Producto.init(
            {
                IdProducto: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                SKU: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                Nombre: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                Categoria: {
                    type: DataTypes.ENUM,
                    values: Object.values(ProdCategory),
                    allowNull: false,
                },
                Descripcion: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                NormaEstiba: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                PiezasXCaja: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'Producto', // Name of the table in the database
            }
        );
        return Producto;
};
