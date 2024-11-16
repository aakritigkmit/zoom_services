"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Booking, {
        foreignKey: "booking_id",
        as: "booking",
      });

      Transaction.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      transaction_status: {
        type: DataTypes.ENUM("Pending", "Success", "Failed"),
        allowNull: true,
        defaultValue: "Pending",
      },
      GST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      CGST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      IGST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      SGST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Transaction;
};
