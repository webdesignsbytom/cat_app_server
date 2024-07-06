import 'dotenv/config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

// Configure a single transporter with a function to set different auth credentials
const createTransporter = (user, pass) => {
  return nodemailer.createTransport({
    pool: true,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // use TLS
    auth: {
      type: 'login',
      user,
      pass,
    },
  });
};

const transporter = createTransporter(process.env.AUTH_EMAIL, process.env.VERIFY_PASS);
const resetTransporter = createTransporter(process.env.RESET_EMAIL, process.env.RESET_PASS);

// Set up handlebars for HTML email templates
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve('./src/utils/emailTemplates/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./src/utils/emailTemplates/'),
};

transporter.use('compile', hbs(handlebarOptions));
resetTransporter.use('compile', hbs(handlebarOptions));

const sendEmail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

export const sendVerificationEmail = async (id, email, uniqueString) => {
  const clientUrl = process.env.VERIFICATION_URL;
  console.log('client url:', clientUrl);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Please verify Your Email',
    template: 'verificationEmail',
    context: {
      verificationUrl: `${clientUrl}/users/verify/${id}/${uniqueString}`,
    },
  };

  console.log('url:', clientUrl + '/verify/' + id + '/' + uniqueString);
  await sendEmail(transporter, mailOptions);
};

export const sendResetPasswordEmail = async (id, email, uniqueString) => {
  const clientUrl = process.env.VERIFICATION_URL;
  console.log('client url:', clientUrl);

  const mailOptions = {
    from: process.env.RESET_EMAIL,
    to: email,
    subject: 'Password Reset',
    template: 'resetPasswordEmail',
    context: {
      resetUrl: `${clientUrl}/users/reset-lost-password/${id}/${uniqueString}`,
    },
  };

  console.log('url:', clientUrl + '/reset-lost-password/' + id + '/' + uniqueString);
  await sendEmail(resetTransporter, mailOptions);
};

export const testEmail = async (email) => {
  console.log('email:', email);
  const clientUrl = process.env.VERIFICATION_URL;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Welcome!',
    template: 'email', // Assuming you have a template named 'email'
    context: {
      title: 'Test Email',
      firstName: 'Tom',
      confirmationUrl: clientUrl,
    },
  };

  await sendEmail(transporter, mailOptions);
};
