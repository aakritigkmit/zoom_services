const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

exports.createUser = async (
  name,
  email,
  phoneNumber,
  password,
  roleName,
  city,
) => {
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // console.log("phoneNumber", phoneNumber);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number: phoneNumber,
    roleName,
    city,
  });

  // console.log(newUser);
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw { statusCode: 400, message: "Role does not exist" };
  }

  await newUser.addRole(role);

  return newUser;
};

exports.fetchUsers = async () => {
  const users = await User.findAll({
    include: {
      model: Role,
      as: "roles",
      through: { attributes: [] },
      required: true,
    },
  });
  const formattedUsers = users.map((user) => ({
    ...user.toJSON(),
    roles: user.roles.map((role) => role.name),
  }));

  // console.log(formattedUsers);
  return formattedUsers;
};

exports.fetchById = async (id, reqUser) => {
  const user = await User.findOne({
    where: { id },
    include: {
      model: Role,
      as: "roles",
      through: { attributes: [] },
      required: true,
    },
  });

  if (!user) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  if (
    reqUser.id !== id &&
    !reqUser.roles.some((role) => role.name === "Admin")
  ) {
    return { statusCode: StatusCodes.FORBIDDEN, message: "Forbidden" };
  }

  return { user };
};
