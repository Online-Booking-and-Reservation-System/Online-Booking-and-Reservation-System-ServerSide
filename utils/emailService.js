
const nodemailer = require('nodemailer');

// Use your Gmail account and App Password here
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ameraabosheta@gmail.com',  // Your full Gmail address
        pass: 'qgqujftixzhwqfvw '  // The generated App Password (without spaces)
    }
});

// Function to send email
const sendBookingConfirmation = async (reservation) => {
    const mailOptions = {
        from: 'ameraabosheta@gmail.com', // Sender email
        to: reservation.customerEmail, // Send to the customer email (assume it's in the reservation data)
        subject: 'Booking Confirmation',
        html: `
      <h1>Thank you for your reservation, ${reservation.customerName}!</h1>
      <p>Here are your booking details:</p>
      <ul>
        <li>Restaurant: ${reservation.resturantName}</li>
        <li>Date: ${reservation.reservationDate.toDateString()}</li>
        <li>Time: ${reservation.reservationTime}</li>
        <li>Number of Guests: ${reservation.numberOfGusts}</li>
        <li>Number of Tables: ${reservation.numberOfTables}</li>
      </ul>
      <p>We look forward to serving you!</p>
    `,
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendBookingConfirmation;
