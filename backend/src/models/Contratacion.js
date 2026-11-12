import { DataTypes, Model } from 'sequelize';

export const ESTADOS_CONTRATACION = ['Activa', 'Suspendida', 'Cancelada'];

/** Plan contratado por un cliente, con su periodo de vigencia. */
export class Contratacion extends Model {
  static initModel(sequelize) {
    Contratacion.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        dominio: { type: DataTypes.STRING(160), allowNull: false, validate: { notEmpty: true } },
        fechaInicio: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_inicio' },
        fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_vencimiento' },
        estado: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'Activa',
          validate: { isIn: [ESTADOS_CONTRATACION] },
        },
      },
      {
        sequelize,
        tableName: 'contrataciones',
        underscored: true,
        validate: {
          vigenciaValida() {
            if (this.fechaInicio && this.fechaVencimiento && this.fechaVencimiento < this.fechaInicio) {
              throw new Error('La fecha de vencimiento debe ser posterior a la de inicio.');
            }
          },
        },
      }
    );
    return Contratacion;
  }
}
