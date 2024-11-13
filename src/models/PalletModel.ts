// Authors:
// * Alfredo Azamar López - A01798100
// * Abner Maximiliano Lecona Nieves - A01753179

// {IMPORTS}
import { Model } from "sequelize";

// Enum for the type of figure of a pallet
enum FigureType {
    Circulo = 'Circulo',
    Triangulo = 'Triangulo',
    Cuadrado = 'Cuadrado',
    Rombo = 'Rombo',
    Estrella = 'Estrella',
}

// Interface for the Pallet Model
interface PalletAttributes {
    IdPallet: number;
    Figura: FigureType;
}

// Define the Pallet Model, for the Sequelize ORM, representing a pallet in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Pallet
        extends Model<PalletAttributes>
        implements PalletAttributes
        {
            // Attributes are enforced by the PalletAttributes interface
            public IdPallet!: number;
            public Figura!: FigureType;

            // Associates the Pallet model with other models
            static associate(models: any) {
                Pallet.belongsTo(models.Producto, {
                    foreignKey: 'IdProducto',
                    as: 'Producto',
                });
            }
        }

        // Initializes the Pallet model with its attributes and options
        Pallet.init(
            {
                IdPallet: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                Figura: {
                    type: DataTypes.ENUM,
                    values: Object.values(FigureType),
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'Pallet', // Name of the table in the database
            }
        );
        return Pallet;
};