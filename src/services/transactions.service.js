const { Transaction, Booking, Car, User, sequelize } = require("../models");
const { sendTransactionEmail } = require("../utils/email.js");

const create = async (data) => {
  console.log(data);
  const { user_id, booking_id } = data;

  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Car, as: "car" },
        { model: User, as: "user" },
      ],
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.user) {
      throw new Error("User not found for this booking");
    }

    const car = booking.car; //line 6 mai booking saari aarhi hai for he specific booking id
    //from that we are extracting cars bookings

    if (car.status === "unavailable") {
      throw new Error("Car is not available for rent");
    }

    const transaction_amount = booking.fare;
    const GST = transaction_amount * 0.18;
    const CGST = transaction_amount * 0.18;
    const IGST = transaction_amount * 0.18;
    const SGST = transaction_amount * 0.18;
    const total_gst = GST + CGST + IGST + SGST;
    const amount_paid = transaction_amount + total_gst;

    const transaction = await Transaction.create(
      {
        user_id,
        booking_id,
        GST,
        CGST,
        IGST,
        SGST,
      },
      { transaction: t },
    );

    transaction.transaction_status = "Success";
    await transaction.save({ transaction: t });

    if (transaction.transaction_status === "Success") {
      booking.status = "Confirmed";
      await booking.save({ transaction: t });

      car.status = "booked";
      await car.save({ transaction: t });

      await sendTransactionEmail({
        to: booking.user.email,
        subject: "Transaction Completed",
        description: "Your booking transaction was successful.",
        car_name: car.model,
        booking_date: booking.created_at,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_amount: booking.fare,
        total_gst,
        amount_paid,
        booking_status: "Confirmed",
      });
    }

    await t.commit();
    return transaction;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = { create };
