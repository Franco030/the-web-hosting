import { DataTypes, Model } from 'sequelize';

/** Preguntas frecuentes: alimentan el acordeón y el chatbot. */
export class PreguntaFrecuente extends Model {
  static initModel(sequelize) {
    PreguntaFrecuente.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        pregunta: { type: DataTypes.STRING(240), allowNull: false },
        respuesta: { type: DataTypes.TEXT, allowNull: false },
        palabrasClave: { type: DataTypes.STRING(400), allowNull: false, defaultValue: '', field: 'palabras_clave' },
        orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { sequelize, tableName: 'preguntas_frecuentes', underscored: true }
    );
    return PreguntaFrecuente;
  }
}
