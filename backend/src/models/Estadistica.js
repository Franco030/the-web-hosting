import { DataTypes, Model } from 'sequelize';

/** Contadores persistentes (visitas totales, etc.) como pares clave-valor. */
export class Estadistica extends Model {
  static initModel(sequelize) {
    Estadistica.init(
      {
        clave: { type: DataTypes.STRING(60), primaryKey: true },
        valor: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0,
          get() {
            return Number(this.getDataValue('valor'));
          },
        },
      },
      { sequelize, tableName: 'estadisticas', underscored: true }
    );
    return Estadistica;
  }
}
