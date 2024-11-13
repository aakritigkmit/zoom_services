const { client } = require("../config/redis");

const bcrypt = require("bcryptjs");

const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");
const { User } = require("../models");
const { Role } = require("../models");

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

exports.registerUser = async (
  name,
  email,
  phoneNumber,
  password,
  roleName,
  city,
) => {
  try {
    const isVerified = await client.get(`verified:${email}`);
    console.log("Email verification status:", isVerified);

    if (!isVerified) {
      throw { statusCode: 400, message: "Email not verified" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone_number: phoneNumber,
      password: hashedPassword,
      roleName,
      city,
    });

    console.log(newUser);

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw { statusCode: 400, message: "Role does not exist" };
    }

    await newUser.addRole(role);

    await client.del(`verified:${email}`);

    return newUser;
  } catch (error) {
    console.error("Validation Error Details:", error.errors || error.message);
    throw {
      statusCode: 500,
      message: error.errors
        ? error.errors[0].message
        : error.message || "An unexpected error occurred.",
    };
  }
};
