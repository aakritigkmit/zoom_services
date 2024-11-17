const { User, Role, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

const createUser = async (name, email, phoneNumber, password, roles, city) => {
  const rollBack = await sequelize.transaction();

  try {
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
      roles,
      city,
    });

    // console.log(newUser);
    const role = await Role.findOne({ where: { name: roles } });
    if (!role) {
      throw { statusCode: 400, message: "Role does not exist" };
    }

    await newUser.addRole(role);
    await rollBack.commit();

    return newUser;
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

// const fetchUsers = async () => {
//   const users = await User.findAll({
//     include: {
//       model: Role,
//       as: "roles",
//       through: { attributes: [] },
//       required: true,
//     },
//   });
//   const formattedUsers = users.map((user) => ({
//     ...user.toJSON(),
//     roles: user.roles.map((role) => role.name),
//   }));

//   // console.log(formattedUsers);
//   return formattedUsers;
// };

const fetchUsers = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const { count, rows: users } = await User.findAndCountAll({
    include: {
      model: Role,
      as: "roles",
      through: { attributes: [] },
      required: true,
    },
    limit: pageSize,
    offset,
  });

  const formattedUsers = users.map((user) => ({
    ...user.toJSON(),
    roles: user.roles.map((role) => role.name),
  }));

  return {
    totalUsers: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    users: formattedUsers,
  };
};

const fetchById = async (id, reqUser) => {
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

const editUserDetails = async (userId, updateData) => {
  const rollBack = await sequelize.transaction();
  try {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
      where: { id: userId },
      returning: true,
    });
    if (rowsUpdated === 0) {
      throw new Error("User not found or no changes made");
    }
    await rollBack.commit();

    return updatedUser;
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

const fetchAllBookingsForUser = async (userId, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Car,
        as: "car",
        attributes: ["id", "model", "year", "fuel_type", "city", "status"],
      },
    ],
    order: [["start_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  return {
    totalBookings: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    bookings,
  };
};

const removeUser = async (id) => {
  const rollBack = await sequelize.transaction();
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return { statusCode: StatusCodes.NOT_FOUND, message: "User not found" };
    }

    await rollBack.commit();
    await user.destroy();

    return { message: "User deleted successfully" };
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

module.exports = {
  createUser,
  fetchUsers,
  removeUser,
  fetchAllBookingsForUser,
  editUserDetails,
  fetchById,
};
