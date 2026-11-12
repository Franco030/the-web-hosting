import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

/** Usuario con acceso a la parte privada (mantenimiento de datos). */
export class Administrador extends Model {
  static initModel(sequelize) {
    Administrador.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING(120), allowNull: false },
        correo: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
        passwordHash: { type: DataTypes.STRING(100), allowNull: false, field: 'password_hash' },
        ultimoAcceso: { type: DataTypes.DATE, field: 'ultimo_acceso' },
      },
      { sequelize, tableName: 'administradores', underscored: true }
    );
    return Administrador;
  }

  async verificarPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  toJSON() {
    const { passwordHash: _omitido, ...resto } = this.get();
    return resto;
  }
}
