import bcrypt from "bcryptjs";

// Generate a 6-digit numeric OTP
export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Hash the OTP
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Verify the OTP against the hash
export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};
