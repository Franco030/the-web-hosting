import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Singleton del transporte de correo. Con SMTP_HOST usa ese servidor; sin él
 * crea una cuenta de prueba de Ethereal (los correos se ven en la URL que
 * devuelve) y, si no hay red o es el entorno de pruebas, un transporte JSON.
 */
export class MailService {
  static #instance = null;
  #transporter = null;
  #modo = null;

  static getInstance() {
    if (!MailService.#instance) MailService.#instance = new MailService();
    return MailService.#instance;
  }

  async #obtenerTransporte() {
    if (this.#transporter) return this.#transporter;
    const { smtp, nodeEnv } = env;
    if (smtp.host) {
      this.#transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
      });
      this.#modo = 'smtp';
    } else if (nodeEnv !== 'test') {
      try {
        const cuenta = await nodemailer.createTestAccount();
        this.#transporter = nodemailer.createTransport({
          host: cuenta.smtp.host,
          port: cuenta.smtp.port,
          secure: cuenta.smtp.secure,
          auth: { user: cuenta.user, pass: cuenta.pass },
        });
        this.#modo = 'ethereal';
      } catch {
        this.#transporter = nodemailer.createTransport({ jsonTransport: true });
        this.#modo = 'json';
      }
    } else {
      this.#transporter = nodemailer.createTransport({ jsonTransport: true });
      this.#modo = 'json';
    }
    return this.#transporter;
  }

  /** Avisa al equipo de un mensaje nuevo y responde al remitente. */
  async enviarContacto({ nombre, correo, asunto, mensaje }) {
    const transporte = await this.#obtenerTransporte();
    const remitente = '"The Web Hosting" <no-responder@thewebhosting.test>';

    const interno = await transporte.sendMail({
      from: remitente,
      to: env.contactTo,
      replyTo: `"${nombre}" <${correo}>`,
      subject: `[Contacto] ${asunto}`,
      text: `${nombre} <${correo}> escribió:\n\n${mensaje}`,
    });
    await transporte.sendMail({
      from: remitente,
      to: correo,
      subject: 'Recibimos tu mensaje',
      text: `Hola, ${nombre}:\n\nGracias por escribirnos. Recibimos tu mensaje "${asunto}" y te responderemos en menos de 24 horas.\n\nEquipo de The Web Hosting`,
    });

    const vistaPrevia = this.#modo === 'ethereal' ? nodemailer.getTestMessageUrl(interno) : null;
    if (vistaPrevia) console.log(`[correo] Vista previa: ${vistaPrevia}`);
    return { modo: this.#modo, vistaPrevia };
  }
}

export default MailService;
