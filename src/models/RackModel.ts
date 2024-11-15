// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Enum for the name of racks
enum RackNames {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H',
    I = 'I',
    J = 'J',
    K = 'K',
    L = 'L',   
}

// Interface for the Rack Model
interface RackAttributes {
    IdRack: RackNames;
    Capacidad: number;
}

// Define the Rack Model, for the Sequelize ORM, representing a rack in a warehouse in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Rack 
        extends Model<RackAttributes> 
        implements RackAttributes 
    {
        // Attributes are enforced by the RackAttributes interface
        public IdRack!: RackNames;
        public Capacidad!: number;
    }

    // Initializes the Rack model with its attributes and options
    Rack.init(
        {
            IdRack: {
                type: DataTypes.ENUM,
                values: Object.values(RackNames),
                allowNull: false,
                primaryKey: true,
            },
            Capacidad: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Rack',
        }
    );

    return Rack;
};