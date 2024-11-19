const { client } = require("../config/redis");

const bcrypt = require("bcryptjs");
const { generateToken } = require("../helpers/jwt.helper");
const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");
const { User } = require("../models");
const { Role } = require("../models");

const sendOtp = async (email) => {
  const otp = generateOtp();
  await client.setEx(`otp:${email}`, 300, otp);
  console.log(otp);
  await sendOtpEmail(email, otp);

  return otp;
};

const verifyOtp = async (email, otp) => {
  // console.log("Verifying OTP for:", email);
  console.log("Received OTP:", otp);

  const storedOtp = await client.get(`otp:${email}`);

  // console.log("Stored OTP from Redis:", storedOtp);
  // console.log("Stored OTP === Received OTP:", storedOtp === otp);

  if (storedOtp && storedOtp === otp) {
    await client.del(`otp:${email}`);
    // console.log("OTP verified successfully. Deleting stored OTP.");

    await client.setEx(`verified:${email}`, 300, "true");
    // console.log(`Email verification set for: ${email}`);

    return true;
  }

  // console.log("OTP verification failed for:", email);
  return false;
};

const registerUser = async (payload) => {
  try {
    const { name, email, phoneNumber, password, roleName, city } = payload;
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
const login = async (email, password) => {
  try {
    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: "roles", attributes: ["name"] },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw { statusCode: 400, message: "Invalid credentials" };
    }

    const token = generateToken({ id: user.id, role: user.roles[0].name });
    return token;
  } catch (error) {
    console.error("Login error:", error.message);
    throw {
      statusCode: error.statusCode || 400,
      message: error.message || "An error occurred during login.",
    };
  }
};

module.exports = {
  login,
  verifyOtp,
  sendOtp,
  registerUser,
};
