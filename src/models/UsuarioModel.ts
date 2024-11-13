// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Interface for the Usuario Model
interface UsuarioAttributes {
    NumEmpleado: number;
    Nombre: string;
}

// Define the Usuario Model, for the Sequelize ORM, representing an employee in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Usuario 
        extends Model<UsuarioAttributes> 
        implements UsuarioAttributes 
    {
        // Attributes are enforced by the UsuarioAttributes interface
        public NumEmpleado!: number;
        public Nombre!: string;
    }

    // Initializes the Usuario model with its attributes and options
    Usuario.init(
        {
            NumEmpleado: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            Nombre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, 
        {
            sequelize,
            modelName: 'Usuario', // Name of the table in the database
        }
    );
    return Usuario;
}