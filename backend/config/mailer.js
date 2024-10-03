
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS  
  }
});

// Función para enviar correos
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER, 
    to,                            
    subject,                       
    text,                          
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

module.exports = { sendEmail };
