const { client } = require("../config/redis");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../helpers/jwt.helper");
const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");
const { User, Role } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError } = require("../helpers/common.helper");
const sendOtp = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw { statusCode: 404, message: "Email not registered" };
  }

  const otp = generateOtp();
  await client.setEx(`otp:${email}`, 300, otp);

  console.log(otp);

  await sendOtpEmail(email, otp);

  return true;
};

const verifyOtp = async (email, otp) => {
  const storedOtp = await client.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return throwCustomError("otp is not valid", StatusCodes.UNAUTHORIZED);
  }

  await client.del(`otp:${email}`);

  await User.update({ verified: true }, { where: { email } });

  return true;
};

const registerUser = async (payload) => {
  const {
    name,
    email,
    phoneNumber,
    password,
    city,
    roleName = ["Customer"],
  } = payload;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { statusCode: 409, message: "User already registered" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    phone_number: phoneNumber,
    password: hashedPassword,
    roleName,
    city,
    verified: false,
  });

  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw { statusCode: 400, message: "Role does not exist" };
  }

  await newUser.addRole(role);

  await sendOtp(email);

  return newUser;
};

const login = async (email, password) => {
  try {
    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: "roles", attributes: ["name"] },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not registered" };
    }

    if (!user.verified) {
      throw { statusCode: 403, message: "User not verified" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 400, message: "Invalid credentials" };
    }

    const token = generateToken({ id: user.id, role: user.roles[0]?.name });
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
  sendOtp,
  verifyOtp,
  registerUser,
  login,
};
