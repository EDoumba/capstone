// Create transporter
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = transporter;

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to VetConnect!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to VetConnect, ${name}!</h2>
          <p>Thank you for joining our community of pet lovers and veterinary professionals.</p>
          <p>With VetConnect, you can:</p>
          <ul>
            <li>Find and book appointments with qualified veterinarians</li>
            <li>Manage your pet's health records</li>
            <li>Chat with your vet in real-time</li>
            <li>Receive important notifications about your appointments</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <br>
          <p>Best regards,<br>The VetConnect Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (email, appointmentDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your VetConnect Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Appointment Confirmed!</h2>
          <p>Your appointment has been successfully scheduled.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Appointment Details:</h3>
            <p><strong>Date:</strong> ${appointmentDetails.date}</p>
            <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            <p><strong>Veterinarian:</strong> Dr. ${appointmentDetails.vetName}</p>
            <p><strong>Reason:</strong> ${appointmentDetails.reason}</p>
          </div>
          <p>You will receive a reminder 24 hours before your appointment.</p>
          <br>
          <p>Best regards,<br>The VetConnect Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
  }
};

// Send notification email
const sendNotificationEmail = async (email, title, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">${title}</h2>
          <p>${message}</p>
          <br>
          <p>Best regards,<br>The VetConnect Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

module.exports = { sendWelcomeEmail, sendAppointmentConfirmation, sendNotificationEmail };