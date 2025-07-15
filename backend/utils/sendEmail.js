const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a test account for development
  let testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', // Use Ethereal for development
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Ecommerce App" <noreply@ecommerce.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  return info;
};

module.exports = sendEmail;
