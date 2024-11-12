// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Enum for the location of racks
enum RackLocations {
    Reserva1 = 'Rerserva1',
    Reserva2 = 'Rerserva2',
    Outbound = 'Outbound',
    Picking = 'Picking',
    Packing = 'Packing',
    Inbound = 'Inbound',
}

// Interface for the Rack Model
interface RackAttributes {
    IdRack: number;
    Ubicacion: RackLocations;
    Pasillo: string;
    Profundidad: number;
    Capacidad: number;
    Afectado: boolean;
}

// Define the Rack Model, for the Sequelize ORM, representing a rack in a warehouse in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Rack 
        extends Model<RackAttributes> 
        implements RackAttributes 
    {
        // Attributes are enforced by the RackAttributes interface
        public IdRack!: number;
        public Ubicacion!: RackLocations;
        public Pasillo!: string;
        public Profundidad!: number;
        public Capacidad!: number;
        public Afectado!: boolean;
    }

    // Initializes the Rack model with its attributes and options
    Rack.init(
        {
            IdRack: {
                type: DataTypes.INTEGER,
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
            Capacidad: {
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
            modelName: 'Rack', // Name of the table in the database
        }
    );
    return Rack;
}