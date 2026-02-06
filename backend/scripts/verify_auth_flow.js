import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Node 18+ has global fetch, but if not, un-comment below
// import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api/auth";
const OTP_FILE = path.join(__dirname, "../otp.txt");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("--- Starting Auth Verification ---");

  // 1. Signup Request (Send OTP)
  const userPayload = {
    email: "testuser@nitk.edu.in",
    name: "Test User",
    branch: "CSE",
    year: 3,
    gender: "MALE",
    interestedIn: "FEMALE",
    interests: ["coding"],
    greenFlags: ["honest"],
    redFlags: ["impatient"],
    profilePics: ["url1"],
  };

  console.log("\n[1] Requesting Signup OTP...");
  try {
    let res = await fetch(`${BASE_URL}/signup/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });
    let data = await res.json();
    console.log("Status:", res.status, data);

    if (!data.success) {
      console.error("Signup OTP failed");
      return;
    }

    // Read OTP from file
    await wait(1000); // Wait for file write
    if (!fs.existsSync(OTP_FILE)) {
      console.error("OTP file not found");
      return;
    }
    const fileContent = fs.readFileSync(OTP_FILE, "utf8");
    // Match OTP regex from message "Your OTP ... is: 123456."
    const otpMatch = fileContent.match(/is: (\d{6})/);
    if (!otpMatch) {
      console.error("Could not parse OTP from file");
      return;
    }
    const otp = otpMatch[1];
    console.log(`\n[2] Retrieved OTP: ${otp}`);

    // 2. Signup Verify
    console.log("\n[3] Verifying Signup OTP...");
    res = await fetch(`${BASE_URL}/signup/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userPayload.email, otp }),
    });
    data = await res.json();
    console.log("Status:", res.status, data);

    if (!data.success) {
      console.error("Signup Verification failed");
    } else {
      console.log("Signup Successful! Token:", !!data.token);
    }

    // 3. Login Request (Send OTP)
    console.log("\n[4] Requesting Login OTP...");
    res = await fetch(`${BASE_URL}/login/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userPayload.email }),
    });
    data = await res.json();
    console.log("Status:", res.status, data);

    // Read new OTP
    await wait(1000);
    const newFileContent = fs.readFileSync(OTP_FILE, "utf8");
    const newOtpMatch = newFileContent.match(/is: (\d{6})/);
    const newOtp = newOtpMatch[1]; // Should work even if file appended, but writeFileSync overwrites? Yes defaults to overwrite.

    // If writeFileSync overwrites, we are good.
    console.log(`\n[5] Retrieved Login OTP: ${newOtp}`);

    // 4. Login Verify
    console.log("\n[6] Verifying Login OTP...");
    res = await fetch(`${BASE_URL}/login/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userPayload.email, otp: newOtp }),
    });
    data = await res.json();
    console.log("Status:", res.status, data);

    if (data.success) {
      console.log("Login Successful! Token:", !!data.token);
    } else {
      console.error("Login Verification failed");
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

runTest();
