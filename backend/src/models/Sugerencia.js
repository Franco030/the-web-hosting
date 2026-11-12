import { DataTypes, Model } from 'sequelize';

/** Mensaje enviado desde el formulario de contacto. */
export class Sugerencia extends Model {
  static initModel(sequelize) {
    Sugerencia.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(120), allowNull: false, validate: { len: [2, 120] } },
        correo: { type: DataTypes.STRING(160), allowNull: false, validate: { isEmail: true } },
        asunto: { type: DataTypes.STRING(160), allowNull: false, validate: { len: [3, 160] } },
        mensaje: { type: DataTypes.TEXT, allowNull: false, validate: { len: [10, 4000] } },
        leida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        correoEnviado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'correo_enviado' },
      },
      { sequelize, tableName: 'sugerencias', underscored: true }
    );
    return Sugerencia;
  }
}
