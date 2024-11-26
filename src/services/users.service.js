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
  const t = await sequelize.transaction();

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throwCustomError("User already exists", StatusCodes.BAD_REQUEST);
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
      throwCustomError("Role does not exist", StatusCodes.BAD_REQUEST);
    }

    await newUser.addRole(role);
    await t.commit();

    return newUser;
  } catch (error) {
    console.log(error.message);
    await t.rollback();
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
    throwCustomError("User not found", StatusCodes.NOT_FOUND);
  }

  return user;
};

const fetchById = async (id, loggedInUser) => {
  if (
    loggedInUser.id !== id &&
    !loggedInUser.roles.some((role) => role.name === "Admin")
  ) {
    throwCustomError("Access Denied ", StatusCodes.FORBIDDEN);
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
    throwCustomError("User not found", StatusCodes.NOT_FOUND);
  }
  return { user };
};

const update = async (userId, updateData) => {
  const rollBack = await sequelize.transaction();
  try {
    const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
      where: { id: userId },
      returning: true,
      transaction: rollBack,
    });

    if (rowsUpdated === 0) {
      throwCustomError(
        "User not found or no changes made",
        StatusCodes.NOT_FOUND,
      );
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
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id);

    if (
      req.user.id !== id &&
      !req.user.roles.some((role) => role.name === "Admin")
    ) {
      throwCustomError("Forbidden", StatusCodes.FORBIDDEN);
    }

    if (!user) {
      throwCustomError("User not found", StatusCodes.NOT_FOUND);
    }

    await t.commit();
    await user.destroy();

    return { message: "User deleted successfully" };
  } catch (error) {
    await t.rollback();
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
