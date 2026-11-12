import { DataTypes, Model } from 'sequelize';

export const TIPOS_PLAN = ['Compartido', 'WordPress', 'VPS', 'Cloud', 'Dedicado'];

/** Plan de hosting que ofrece la compañía (catálogo público). */
export class Plan extends Model {
  static initModel(sequelize) {
    Plan.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true, validate: { notEmpty: true } },
        tipo: { type: DataTypes.STRING(20), allowNull: false, validate: { isIn: [TIPOS_PLAN] } },
        descripcion: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
        precioMensual: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'precio_mensual',
          validate: { min: 0 },
          get() {
            const v = this.getDataValue('precioMensual');
            return v === null || v === undefined ? v : Number(v);
          },
        },
        almacenamientoGB: { type: DataTypes.INTEGER, allowNull: false, field: 'almacenamiento_gb', validate: { min: 1 } },
        transferenciaGB: { type: DataTypes.INTEGER, allowNull: true, field: 'transferencia_gb', comment: 'null = ilimitada' },
        sitios: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
        cuentasCorreo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'cuentas_correo', validate: { min: 0 } },
        basesDatos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'bases_datos', validate: { min: 0 } },
        ram: { type: DataTypes.STRING(20), allowNull: true },
        cpu: { type: DataTypes.STRING(40), allowNull: true },
        sslGratis: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'ssl_gratis' },
        respaldos: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'Semanales' },
        soporte: { type: DataTypes.STRING(60), allowNull: false, defaultValue: '24/7 por chat y correo' },
        destacado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { sequelize, tableName: 'planes', underscored: true }
    );
    return Plan;
  }
}
