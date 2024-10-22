require('dotenv').config();

const nodemailer = require('nodemailer');

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
        });
        console.log('Correo enviado exitosamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response);
        }
        throw error;
    }
}; 

module.exports = { sendEmail };