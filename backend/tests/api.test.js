import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Entorno de pruebas: base SQLite en memoria y correo con transporte JSON.
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = '';

const { default: request } = await import('supertest');
const { Database } = await import('../src/config/Database.js');
await import('../src/models/index.js');
const { App } = await import('../src/app.js');
const { sembrar } = await import('../src/seed/seed.js');
const { env } = await import('../src/config/env.js');
const { VisitCounter } = await import('../src/services/VisitCounter.js');

const app = new App().express;
let token;

before(async () => {
  await Database.getInstance().sync({ force: true });
  await sembrar();
});

after(async () => {
  await Database.getInstance().close();
});

describe('Patrón Singleton', () => {
  it('Database.getInstance() devuelve siempre la misma instancia', () => {
    assert.equal(Database.getInstance(), Database.getInstance());
  });

  it('Database no se puede instanciar con new', () => {
    assert.throws(() => new Database(), /Singleton/);
  });

  it('VisitCounter es único', () => {
    assert.equal(VisitCounter.getInstance(), VisitCounter.getInstance());
  });
});

describe('Autenticación de administradores', () => {
  it('rechaza credenciales incorrectas', async () => {
    const res = await request(app).post('/api/auth/login').send({ correo: env.adminSeed.email, password: 'mala' });
    assert.equal(res.status, 401);
  });

  it('entrega un token con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: env.adminSeed.email, password: env.adminSeed.password });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.administrador.passwordHash, undefined);
    token = res.body.token;
  });

  it('protege las rutas privadas', async () => {
    const res = await request(app).get('/api/sugerencias');
    assert.equal(res.status, 401);
  });
});

describe('Búsqueda de planes', () => {
  it('lista los planes activos', async () => {
    const res = await request(app).get('/api/planes');
    assert.equal(res.status, 200);
    assert.ok(res.body.length >= 10);
  });

  it('filtra por texto', async () => {
    const res = await request(app).get('/api/planes').query({ q: 'wordpress' });
    assert.ok(res.body.length >= 2);
    assert.ok(res.body.every((p) => p.tipo === 'WordPress' || /wordpress/i.test(p.descripcion)));
  });

  it('filtra por tipo y precio máximo, ordenado por precio', async () => {
    const res = await request(app).get('/api/planes').query({ tipo: 'VPS', precioMax: 400, orden: 'precio_asc' });
    assert.deepEqual(res.body.map((p) => p.nombre), ['VPS 2']);
  });

  it('genera la ficha técnica en PDF', async () => {
    const res = await request(app).get('/api/planes/1/ficha').buffer(true);
    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'application/pdf');
    assert.ok(res.body.subarray(0, 4).toString() === '%PDF');
  });
});

describe('Mantenimiento de planes (solo administradores)', () => {
  let id;
  const nuevo = { nombre: 'Prueba', tipo: 'Cloud', precioMensual: 999, almacenamientoGB: 50, descripcion: 'Plan de prueba' };

  it('no permite crear sin sesión', async () => {
    const res = await request(app).post('/api/planes').send(nuevo);
    assert.equal(res.status, 401);
  });

  it('crea un plan', async () => {
    const res = await request(app).post('/api/planes').set('Authorization', `Bearer ${token}`).send(nuevo);
    assert.equal(res.status, 201);
    id = res.body.id;
  });

  it('valida los campos', async () => {
    const res = await request(app)
      .post('/api/planes')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...nuevo, nombre: 'Otro', tipo: 'Inventado' });
    assert.equal(res.status, 400);
    assert.ok(res.body.campos.tipo);
  });

  it('actualiza un plan', async () => {
    const res = await request(app).put(`/api/planes/${id}`).set('Authorization', `Bearer ${token}`).send({ precioMensual: 899 });
    assert.equal(res.body.precioMensual, 899);
  });

  it('elimina un plan sin contrataciones', async () => {
    const res = await request(app).delete(`/api/planes/${id}`).set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 204);
  });

  it('no elimina un plan con contrataciones', async () => {
    const res = await request(app).delete('/api/planes/2').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 409);
  });
});

describe('Contacto y sugerencias', () => {
  it('guarda un mensaje del formulario de contacto', async () => {
    const res = await request(app).post('/api/sugerencias').send({
      nombre: 'Persona de prueba', correo: 'prueba@correo.test', asunto: 'Hola', mensaje: 'Mensaje de prueba suficientemente largo.',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.correoEnviado, true);
  });

  it('rechaza un correo inválido', async () => {
    const res = await request(app).post('/api/sugerencias').send({ nombre: 'X Y', correo: 'no-es-correo', asunto: 'Hola', mensaje: 'Mensaje de prueba largo.' });
    assert.equal(res.status, 400);
    assert.ok(res.body.campos.correo);
  });

  it('pagina las sugerencias', async () => {
    const res = await request(app).get('/api/sugerencias').query({ page: 2, pageSize: 5 }).set('Authorization', `Bearer ${token}`);
    assert.equal(res.body.page, 2);
    assert.equal(res.body.items.length, 5);
    assert.equal(res.body.total, 14);
    assert.equal(res.body.totalPages, 3);
  });

  it('exporta a Excel', async () => {
    const res = await request(app).get('/api/sugerencias/exportar/excel').set('Authorization', `Bearer ${token}`).buffer(true);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /spreadsheetml/);
  });

  it('exporta a PDF', async () => {
    const res = await request(app).get('/api/sugerencias/exportar/pdf').set('Authorization', `Bearer ${token}`).buffer(true);
    assert.equal(res.headers['content-type'], 'application/pdf');
  });
});

describe('Dashboards', () => {
  it('agrupa las contrataciones por tipo de plan', async () => {
    const res = await request(app).get('/api/dashboard/planes-por-tipo').set('Authorization', `Bearer ${token}`);
    assert.equal(res.body.porTipo.length, 5);
    assert.equal(res.body.totalContrataciones, 21);
  });

  it('lista los planes que vencen en los próximos 10 días', async () => {
    const res = await request(app).get('/api/dashboard/vencimientos').set('Authorization', `Bearer ${token}`);
    assert.equal(res.body.dias, 10);
    assert.equal(res.body.porDia.length, 10);
    assert.equal(res.body.contrataciones.length, 8);
  });
});

describe('Chatbot, contenido y visitas', () => {
  it('responde un saludo', async () => {
    const res = await request(app).post('/api/chatbot').send({ mensaje: 'Hola' });
    assert.match(res.body.texto, /Hosti/);
  });

  it('responde con una pregunta frecuente', async () => {
    const res = await request(app).post('/api/chatbot').send({ mensaje: '¿Incluye certificado SSL?' });
    assert.match(res.body.texto, /SSL gratis/);
  });

  it('entrega las preguntas frecuentes', async () => {
    const res = await request(app).get('/api/preguntas-frecuentes');
    assert.equal(res.body.length, 9);
  });

  it('cuenta las visitas', async () => {
    const antes = (await request(app).get('/api/visitas')).body.visitas;
    const res = await request(app).post('/api/visitas');
    assert.equal(res.body.visitas, antes + 1);
  });
});

describe('Chatbot: prioridad de intenciones', () => {
  it('lista precios cuando piden planes de un tipo', async () => {
    const res = await request(app).post('/api/chatbot').send({ mensaje: 'planes vps' });
    assert.match(res.body.texto, /VPS 2/);
  });

  it('usa la pregunta frecuente cuando coincide mejor', async () => {
    const res = await request(app).post('/api/chatbot').send({ mensaje: '¿Cuál plan me conviene para WordPress?' });
    assert.match(res.body.texto, /WP Básico/);
  });
});
