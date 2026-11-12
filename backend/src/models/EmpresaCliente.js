import { DataTypes, Model } from 'sequelize';

/** Empresas (hipotéticas) que se muestran en la sección "Clientes". */
export class EmpresaCliente extends Model {
  static initModel(sequelize) {
    EmpresaCliente.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(120), allowNull: false },
        giro: { type: DataTypes.STRING(120), allowNull: false, defaultValue: '' },
        sitioWeb: { type: DataTypes.STRING(240), allowNull: false, field: 'sitio_web', validate: { isUrl: true } },
        logo: { type: DataTypes.STRING(240), allowNull: false, comment: 'Ruta pública de la imagen optimizada' },
        orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { sequelize, tableName: 'empresas_cliente', underscored: true }
    );
    return EmpresaCliente;
  }
}
