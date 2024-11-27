const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require("../helpers/serializer.helper");

const bookingSerializer = (booking) => ({
  id: booking.id,
  userId: booking.user_id,
  carId: booking.car_id,
  startDate: booking.start_date,
  endDate: booking.end_date,
  dropOffTime: booking.drop_off_time,
  status: booking.status,
  fare: booking.fare,
  feedback: booking.feedback,
  estimatedDistance: booking.estimated_distance,
  car: booking.car ? { id: booking.car.id, model: booking.car.model } : null,
  user: booking.user
    ? {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
      }
    : null,
  ...normalizeTimestamps(booking),
});

const transactionSerializerMiddleware = (transaction) => ({
  id: transaction.id,
  transactionStatus: transaction.transaction_status,
  userId: transaction.user_id,
  bookingId: transaction.booking_id,
  GST: transaction.GST,
  CGST: transaction.CGST,
  IGST: transaction.IGST,
  SGST: transaction.SGST,
  amount: transaction.amount,
  booking: transaction.booking ? bookingSerializer(transaction.booking) : null,
  ...normalizeTimestamps(transaction),
});

const transactionsListSerializer = (transactionsData) => ({
  transactions: transactionsData.map(transactionSerializerMiddleware),
  pagination: transactionsData.pagination,
});

const transactionSerializer = (req, res, next) => {
  if (!res.data) {
    return next();
  }

  const serializeData = (data) => {
    if (data.transaction) {
      return { transaction: transactionSerializerMiddleware(data.transaction) };
    } else if (data.transactions) {
      return transactionsListSerializer(data.transactions);
    } else {
      return data;
    }
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data);

  next();
};

module.exports = {
  transactionSerializer,
};
