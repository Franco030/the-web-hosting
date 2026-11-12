import { DataTypes, Model } from 'sequelize';

/** Cliente que contrata planes (persona o empresa). */
export class Cliente extends Model {
  static initModel(sequelize) {
    Cliente.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
        correo: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
        empresa: { type: DataTypes.STRING(120), allowNull: true },
        telefono: { type: DataTypes.STRING(30), allowNull: true },
      },
      { sequelize, tableName: 'clientes', underscored: true }
    );
    return Cliente;
  }
}
