const { client } = require("../config/redis");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../helpers/jwt.helper");
const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");
const { User, Role, sequelize } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { throwCustomError } = require("../helpers/common.helper");

const sendOtp = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throwCustomError("Email not registered", StatusCodes.NOT_FOUND);
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

  const transaction = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { name: roleName }, transaction });

    if (!role) {
      throwCustomError("Role not found", StatusCodes.NOT_FOUND);
    }

    let user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        as: "roles",
        attributes: ["id", "name"],
      },
      transaction,
    });

    if (user) {
      const hasRole = user.roles.some(
        (existingRole) => existingRole.name === roleName,
      );

      if (hasRole) {
        throwCustomError(
          `User with email '${email}' already has the '${roleName}' role.`,
          StatusCodes.BAD_REQUEST,
        );
      }

      // Add role to the existing user
      await user.addRole(role, { transaction });
    } else {
      const existingUser = await User.findOne({
        where: { email },
        transaction,
      });

      if (existingUser) {
        throwCustomError("User already registered", StatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      user = await User.create(
        {
          name,
          email,
          phone_number: phoneNumber,
          password: hashedPassword,
          city,
          verified: false,
        },
        { transaction },
      );

      await user.addRole(role, { transaction });

      await sendOtp(email);
    }

    await transaction.commit();

    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = async (payload) => {
  const { email, password } = payload;
  const user = await User.findOne({
    where: { email },
    include: { model: Role, as: "roles", attributes: ["name"] },
  });

  if (!user) {
    throwCustomError("User not registered", StatusCodes.NOT_FOUND);
  }

  if (!user.verified) {
    throwCustomError("User not verified", StatusCodes.FORBIDDEN);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throwCustomError("Invalid credentials", StatusCodes.BAD_REQUEST);
  }

  const token = generateToken({ id: user.id, role: user.roles[0]?.name });

  return token;
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  login,
};
