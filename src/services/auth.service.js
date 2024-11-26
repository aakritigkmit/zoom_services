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
    throwCustomError(" Email not registered ", StatusCodes.NOT_FOUND);
  }

  const otp = generateOtp();
  await client.setEx(`otp:${email}`, 300, otp);

  console.log(otp);

  await sendOtpEmail(email, otp);

  return true;
};

const verifyOtp = async (payload) => {
  const { email, otp } = payload;

  const storedOtp = await client.get(`otp:${email}`);

  if (!storedOtp || storedOtp !== otp) {
    throwCustomError("otp is not valid", StatusCodes.UNAUTHORIZED);
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
    return throwCustomError("Role does not exist", StatusCodes.BAD_REQUEST);
  }

  await newUser.addRole(role);

  await sendOtp(email);

  return newUser;
};

const login = async (payload) => {
  try {
    const { email, password } = payload;
    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: "roles", attributes: ["name"] },
    });

    if (!user) {
      throw throwCustomError("User not registered", StatusCodes.NOT_FOUND);
    }

    if (!user.verified) {
      throw throwCustomError("User not verified", StatusCodes.FORBIDDEN);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw throwCustomError("Invalid credentials", StatusCodes.BAD_REQUEST);
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
