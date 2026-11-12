-- =====================================================================
-- The Web Hosting · Modelo físico de la base de datos (MySQL 8 / MariaDB)
-- Equivalente al esquema que crea el ORM (Sequelize) en SQLite durante el
-- desarrollo. En producción basta con DB_DIALECT=mysql y `npm start`:
-- Sequelize crea estas mismas tablas. Este script sirve como referencia y
-- para crearlas a mano.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS the_web_hosting
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE the_web_hosting;

-- Usuarios de la parte privada
CREATE TABLE administradores (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(120)  NOT NULL,
  correo         VARCHAR(160)  NOT NULL,
  password_hash  VARCHAR(100)  NOT NULL COMMENT 'bcrypt, 10 rondas',
  ultimo_acceso  DATETIME      NULL,
  created_at     DATETIME      NOT NULL,
  updated_at     DATETIME      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administradores_correo (correo)
) ENGINE=InnoDB;

-- Catálogo de planes de hosting (servicios que ofrece la compañía)
CREATE TABLE planes (
  id                 INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  nombre             VARCHAR(80)    NOT NULL,
  tipo               VARCHAR(20)    NOT NULL COMMENT 'Compartido | WordPress | VPS | Cloud | Dedicado',
  descripcion        TEXT           NOT NULL,
  precio_mensual     DECIMAL(10,2)  NOT NULL,
  almacenamiento_gb  INT            NOT NULL,
  transferencia_gb   INT            NULL COMMENT 'NULL = ilimitada',
  sitios             INT            NOT NULL DEFAULT 1 COMMENT '999 = ilimitados',
  cuentas_correo     INT            NOT NULL DEFAULT 0,
  bases_datos        INT            NOT NULL DEFAULT 1,
  ram                VARCHAR(20)    NULL,
  cpu                VARCHAR(40)    NULL,
  ssl_gratis         TINYINT(1)     NOT NULL DEFAULT 1,
  respaldos          VARCHAR(40)    NOT NULL DEFAULT 'Semanales',
  soporte            VARCHAR(60)    NOT NULL DEFAULT '24/7 por chat y correo',
  destacado          TINYINT(1)     NOT NULL DEFAULT 0,
  activo             TINYINT(1)     NOT NULL DEFAULT 1,
  created_at         DATETIME       NOT NULL,
  updated_at         DATETIME       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planes_nombre (nombre),
  KEY ix_planes_tipo (tipo),
  KEY ix_planes_precio (precio_mensual),
  CONSTRAINT ck_planes_tipo CHECK (tipo IN ('Compartido','WordPress','VPS','Cloud','Dedicado')),
  CONSTRAINT ck_planes_precio CHECK (precio_mensual >= 0)
) ENGINE=InnoDB;

-- Clientes que contratan planes
CREATE TABLE clientes (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(120)  NOT NULL,
  correo      VARCHAR(160)  NOT NULL,
  empresa     VARCHAR(120)  NULL,
  telefono    VARCHAR(30)   NULL,
  created_at  DATETIME      NOT NULL,
  updated_at  DATETIME      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_correo (correo)
) ENGINE=InnoDB;

-- Plan contratado por un cliente (base de los dashboards)
CREATE TABLE contrataciones (
  id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  cliente_id         INT UNSIGNED  NOT NULL,
  plan_id            INT UNSIGNED  NOT NULL,
  dominio            VARCHAR(160)  NOT NULL,
  fecha_inicio       DATE          NOT NULL,
  fecha_vencimiento  DATE          NOT NULL,
  estado             VARCHAR(20)   NOT NULL DEFAULT 'Activa' COMMENT 'Activa | Suspendida | Cancelada',
  created_at         DATETIME      NOT NULL,
  updated_at         DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY ix_contrataciones_vencimiento (estado, fecha_vencimiento),
  CONSTRAINT fk_contrataciones_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_contrataciones_plan FOREIGN KEY (plan_id) REFERENCES planes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_contrataciones_vigencia CHECK (fecha_vencimiento >= fecha_inicio)
) ENGINE=InnoDB;

-- Mensajes del formulario de contacto
CREATE TABLE sugerencias (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(120)  NOT NULL,
  correo          VARCHAR(160)  NOT NULL,
  asunto          VARCHAR(160)  NOT NULL,
  mensaje         TEXT          NOT NULL,
  leida           TINYINT(1)    NOT NULL DEFAULT 0,
  correo_enviado  TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL,
  updated_at      DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY ix_sugerencias_fecha (created_at)
) ENGINE=InnoDB;

-- Preguntas frecuentes (acordeón y chatbot)
CREATE TABLE preguntas_frecuentes (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  pregunta        VARCHAR(240)  NOT NULL,
  respuesta       TEXT          NOT NULL,
  palabras_clave  VARCHAR(400)  NOT NULL DEFAULT '',
  orden           INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL,
  updated_at      DATETIME      NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Empresas (ficticias) de la sección "Clientes"
CREATE TABLE empresas_cliente (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(120)  NOT NULL,
  giro        VARCHAR(120)  NOT NULL DEFAULT '',
  sitio_web   VARCHAR(240)  NOT NULL,
  logo        VARCHAR(240)  NOT NULL COMMENT 'Ruta pública de la imagen optimizada (SVG)',
  orden       INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL,
  updated_at  DATETIME      NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Contadores persistentes (visitas totales)
CREATE TABLE estadisticas (
  clave       VARCHAR(60)  NOT NULL,
  valor       BIGINT       NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL,
  updated_at  DATETIME     NOT NULL,
  PRIMARY KEY (clave)
) ENGINE=InnoDB;
