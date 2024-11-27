const { Transaction, Booking, Car, User, sequelize } = require("../models");
const { sendTransactionEmail } = require("../utils/email.js");
const { throwCustomError } = require("../helpers/common.helper");
const { StatusCodes } = require("http-status-codes");

const fetchAll = async (data) => {
  const { page = 1, limit = 10, ...filters } = data;

  const whereConditions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Transaction.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Booking,
        as: "booking",
        attributes: ["id", "fare"],
        include: [
          { model: Car, as: "car", attributes: ["id", "model"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
        ],
      },
    ],
    offset,
    limit: parseInt(limit),
    order: [["created_at", "DESC"]],
  });

  return {
    transactions: rows,
    pagination: {
      totalItems: count,
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const fetchById = async (id) => {
  const transaction = await Transaction.findOne({
    where: { id },
    include: [
      {
        model: Booking,
        as: "booking",
        attributes: ["id"],
        include: [
          {
            model: Car,
            as: "car",
            attributes: ["id", "model"],
            include: [
              { model: User, as: "user", attributes: ["id", "name", "email"] },
            ],
          },
        ],
      },
    ],
  });

  if (!transaction) {
    return throwCustomError("Transaction not found", StatusCodes.NOT_FOUND);
  }

  return transaction;
};

const remove = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const transactionRecord = await Transaction.findByPk(id, { transaction });
    if (!transactionRecord) {
      throwCustomError("Transaction not found", StatusCodes.NOT_FOUND);
    }

    await transactionRecord.destroy({ transaction });

    await transaction.commit();
    return { message: "Transaction removed successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = { fetchAll, fetchById, remove };
