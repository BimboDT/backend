// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Enum for the location of racks
enum RackLocations {
    Reserva1 = 'Reserva1',
    Reserva2 = 'Reserva2',
    Outbound = 'Outbound',
    Picking = 'Picking',
    Packing = 'Packing',
    Inbound = 'Inbound',
}

// Interface for the Posicion Model
interface PosAttributes {
    IdPos: number;
    Ubicacion: RackLocations;
    Pasillo: string;
    Profundidad: number;
    Afectado: boolean;
}

// Define the Posicion Model, for the Sequelize ORM, representing the positions inside a warehouse in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Posicion 
        extends Model<PosAttributes> 
        implements PosAttributes 
    {
        // Attributes are enforced by the PosAttributes interface
        public IdPos!: number;
        public Ubicacion!: RackLocations;
        public Pasillo!: string;
        public Profundidad!: number;
        public Afectado!: boolean;
    }

    // Initializes the Posicion model with its attributes and options
    Posicion.init(
        {
            IdPos: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            Ubicacion: {
                type: DataTypes.ENUM,
                values: Object.values(RackLocations),
                allowNull: false,
            },
            Pasillo: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Profundidad: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Afectado: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        }, 
        {
            sequelize,
            modelName: 'Posicion', // Name of the table in the database
        }
    );
    return Posicion;
}