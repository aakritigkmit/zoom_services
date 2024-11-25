const {
  User,
  Role,
  sequelize,
  Booking,
  Car,
  Transaction,
} = require("../models");

const { throwCustomError } = require("../helpers/common.helper");

const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

const create = async (payload) => {
  const { name, email, phoneNumber, password, roles, city } = payload;
  const rollBack = await sequelize.transaction();

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw throwCustomError("User already exists", StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number: phoneNumber,
      roles,
      city,
      verified: true,
    });

    const role = await Role.findOne({ where: { name: roles } });
    if (!role) {
      throw { statusCode: 400, message: "Role does not exist" };
    }

    await newUser.addRole(role);
    await rollBack.commit();

    return newUser;
  } catch (error) {
    console.log(error.message);
    await rollBack.rollback();
    throw error;
  }
};

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

const fetchCurrentUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const fetchById = async (id, loggedInUser) => {
  if (
    loggedInUser.id !== id &&
    !loggedInUser.roles.some((role) => role.name === "Admin")
  ) {
    return { statusCode: StatusCodes.FORBIDDEN, message: "Forbidden" };
  }

  const user = await User.findOne({
    where: { id },

    include: {
      model: Role,
      as: "roles",
      attributes: ["name"],
      through: { attributes: [] },
      required: true,
    },
  });

  if (!user) {
    return { statusCode: StatusCodes.NOT_FOUND, message: "User not found" };
  }

  console.log("FetchById Services", user);
  return { user };
};

const update = async (userId, updateData) => {
  const rollBack = await sequelize.transaction();
  try {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
      where: { id: userId },
      returning: true,
      transaction: rollBack,
    });

    if (rowsUpdated === 0) {
      throw new Error("User not found or no changes made");
    }

    const safeUpdatedUser = updatedUser.get({ plain: true });
    delete safeUpdatedUser.password;

    await rollBack.commit();

    return safeUpdatedUser;
  } catch (error) {
    await rollBack.rollback();
    throw error;
  }
};

const fetchBookings = async (userId, page = 1, pageSize = 10) => {
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

const fetchTransactions = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const transactions = await Transaction.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: Booking,
        as: "booking",
        attributes: ["id"],
        include: [
          {
            model: Car,
            as: "car",
            attributes: ["id", "model", "status"],
          },
        ],
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return {
    total: transactions.count,
    pages: Math.ceil(transactions.count / limit),
    currentPage: page,
    transactions: transactions.rows,
  };
};

const remove = async (id) => {
  const rollBack = await sequelize.transaction();
  try {
    const user = await User.findByPk(id);

    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      return throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

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
  fetchTransactions,
  fetchBookings,
  fetchCurrentUser,
  remove,
  update,
  fetchById,
  fetchUsers,
  create,
};
