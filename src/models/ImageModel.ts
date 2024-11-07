// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Enum for the location of racks
enum RackLocations {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
}

// Interface for the Image Model
interface ImageAttributes {
    IdImagen: number;
    Ubicacion: RackLocations;
    Tipo: boolean;
    Url: string;
    Fecha: string;
}

// Define the Image Model, for the Sequelize ORM, representing an image taken in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Image 
        extends Model<ImageAttributes>
        implements ImageAttributes
    {
        // Attributes are enforced by the ImageAttributes interface
        public IdImagen!: number;
        public Ubicacion!: RackLocations;
        public Tipo!: boolean;
        public Url!: string;
        public Fecha!: string;
    }

    // Initializes the Image model with its attributes and options
    Image.init(
        {
            IdImagen: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            Ubicacion: {
                type: DataTypes.ENUM,
                values: Object.values(RackLocations),
                allowNull: false,
            },
            Tipo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            Url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Fecha: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Imagen', // Name of the table in the database
        }
    );
    return Image;
};
