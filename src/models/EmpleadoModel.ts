// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from 'sequelize';

// Interface for the Empleado Model
interface EmpleadoAttributes {
    NumEmpleado: number;
    Nombre: string;
}

// Define the Empleado Model, for the Sequelize ORM, representing an employee in the database
module.exports = (sequelize: any, DataTypes: any) => {
    class Empleado 
        extends Model<EmpleadoAttributes> 
        implements EmpleadoAttributes 
    {
        // Attributes are enforced by the EmpleadoAttributes interface
        public NumEmpleado!: number;
        public Nombre!: string;
    }

    // Initializes the Empleado model with its attributes and options
    Empleado.init(
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
            modelName: 'Empleado', // Name of the table in the database
        }
    );
    return Empleado;
}