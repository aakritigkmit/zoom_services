const { client } = require("../config/redis");
const { generateOtp } = require("../utils/otp");

const { sendOtpEmail } = require("../utils/email");

exports.sendOtp = async (email) => {
  const otp = generateOtp();
  await client.setEx(`otp:${email}`, 300, otp);
  console.log(otp);
  await sendOtpEmail(email, otp);

  return otp;
};
