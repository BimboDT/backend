// Authors:
// * Alfredo Azamar López - A01798100

// {IMPORTS}
import { Model } from "sequelize";

// Interface for the Conteo Model
interface ConteoAttributes {
  IdConteo: number;
  Pallets: number;
  FechaCad: string;
  FechaConteo: string;
  CajasSistema: number;
  CajasFisico: number;
  DifCajas: number;
}

// Define the Conteo Model, for the Sequelize ORM, representing a "conteo cíclico" in the database
module.exports = (sequelize: any, DataTypes: any) => {
  class Conteo 
    extends Model<ConteoAttributes> 
    implements ConteoAttributes 
    {
        // Attributes are enforced by the ConteoAttributes interface
        public IdConteo!: number;
        public Pallets!: number;
        public FechaCad!: string;
        public FechaConteo!: string;
        public CajasSistema!: number;
        public CajasFisico!: number;
        public DifCajas!: number;

        // Associates the Conteo model with other models
        static associate(models: any) {
            Conteo.belongsTo(models.Posicion, {
                foreignKey: "IdPos",
                as: "Posicion",
            });
            Conteo.belongsTo(models.Rack, {
                foreignKey: "IdRack",
                as: "Rack",
            });
            Conteo.belongsTo(models.Producto, {
                foreignKey: "IdProducto",
                as: "Producto",
            });
            Conteo.belongsTo(models.Empleado, {
                foreignKey: "NumEmpleado",
                as: "Empleado",
            });
        }
    }
    
    // Initializes the Conteo model with its attributes and options
    Conteo.init(
        {
        IdConteo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        Pallets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        FechaCad: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        FechaConteo: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        CajasSistema: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CajasFisico: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        DifCajas: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        },
        {
        sequelize,
        modelName: "Conteo", // Name of the table in the database
        }
    );
    return Conteo;
};
