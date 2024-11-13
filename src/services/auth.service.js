const { client } = require("../config/redis");
const { generateOtp } = require("../utils/otp");

const { sendOtpEmail } = require("../utils/email");

exports.sendOtp = async (email) => {
  const otp = generateOtp();
  await client.setEx(`otp:${email}`, 300, otp);
  console.log(otp);
  await sendOtpEmail(email, otp);

  return otp;
};

exports.verifyOtp = async (email, otp) => {
  console.log("Verifying OTP for:", email);
  console.log("Received OTP:", otp);

  // Retrieve the stored OTP from Redis
  const storedOtp = await client.get(`otp:${email}`);

  // Log the stored OTP and comparison result
  console.log("Stored OTP from Redis:", storedOtp);
  console.log("Stored OTP === Received OTP:", storedOtp === otp);

  // Check if the OTP exists and matches
  if (storedOtp && storedOtp === otp) {
    // Delete the OTP from Redis after successful verification
    await client.del(`otp:${email}`);
    console.log("OTP verified successfully. Deleting stored OTP.");

    // Set email verification flag
    await client.setEx(`verified:${email}`, 300, "true");
    console.log(`Email verification set for: ${email}`);

    return true;
  }

  // If OTP is invalid or expired
  console.log("OTP verification failed for:", email);
  return false;
};
