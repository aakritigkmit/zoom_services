"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Booking.belongsTo(models.Car, { foreignKey: "car_id", as: "car" });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      car_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "cars",
          key: "id",
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("picked_up", "dropped_off", "canceled"),
        allowNull: false,
      },
      fare: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      distance_estimate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  return Booking;
};