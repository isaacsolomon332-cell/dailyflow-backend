// require('dotenv').config();
// const nodemailer = require('nodemailer');

// const t = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT) || 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// t.sendMail({
//   from: process.env.EMAIL_USER,
//   to: process.env.EMAIL_USER,
//   subject: 'DailyFlow Test',
//   text: 'If you see this, email is working!'
// }).then(r => console.log('SUCCESS', r.messageId))
//   .catch(e => console.error('FAILED', e.message));