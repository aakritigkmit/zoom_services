const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
exports.sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 1 minute.`,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendTransactionEmail = async ({
  to,
  subject,
  description,
  car_name,
  booking_date,
  start_date,
  end_date,
  total_amount,
  total_gst,
  amount_paid,
  booking_status,
}) => {
  const emailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    // text: `
    //   ${description}\n
    //   Movie name: ${movie_name}\n
    //   Show Time: ${show_time}\n
    //   Booking Time: ${booking_time}\n
    //   Total Ticket Amount: ${total_amount}\n
    //   Total GST: ${total_gst}\n
    //   Total Amount Paid: ${amount_paid}\n
    //   Booking Status: ${booking_status}\n
    // `,
    html: `
      <h1>${subject}</h1>
      <p>${description}</p>
      <p><strong>Car Name:</strong> ${car_name}</p>
      <p><strong>Booking Date:</strong> ${new Date(booking_date).toLocaleString()}</p>
      <p><strong>Start date:</strong> ${start_date}</p>
      <p><strong>End date:</strong> ${end_date}</p>
      <p><strong>Total Amount:</strong> ₹${total_amount}</p>
      <p><strong>Total GST:</strong> ₹${total_gst}</p>
      <p><strong>Amount Paid:</strong> ₹${amount_paid}</p>
      <p><strong>Booking Status:</strong> ${booking_status}</p>
    `,
  };

  await transporter.sendMail(emailOptions);
};
