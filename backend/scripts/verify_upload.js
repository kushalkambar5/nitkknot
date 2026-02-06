import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api/auth";
const OTP_FILE = path.join(__dirname, "../otp.txt");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runUploadTest() {
  console.log("--- Starting Image Upload Verification ---");

  // Create a dummy image
  const imagePath = path.join(__dirname, "test_image.png");
  // Create a small 1x1 png or just validation text (multer checks mimetype, strictly validated images needed?)
  // Multer checks magic numbers? No, usually mimetype from header or extension unless magic check middleware used.
  // But our middleware checks mimetype from file object which comes from header in multipart.
  // Actually, standard multer fileFilter checks file.mimetype which is trusted from user input in many cases but let's try to be proper.
  // Let's create a dummy text file but name it .png and give it image/png type.
  // Wait, our middleware checks `file.mimetype`.
  // Base64 conversion needs buffer.

  // Real image buffer (1x1 pixel transparent ping)
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwjwAAAAABJRU5ErkJggg==",
    "base64",
  );
  fs.writeFileSync(imagePath, pngBuffer);

  const form = new FormData();
  form.append("email", "uploadtest@nitk.edu.in");
  form.append("name", "Upload Tester");
  form.append("branch", "IT");
  form.append("year", 2);
  form.append("gender", "FEMALE");
  form.append("interestedIn", "MALE");
  form.append("interests", "design"); // single item array? FormData usually sends array if multiple. Middleware parses body?
  // Express .json() middleware doesn't parse multipart.
  // Multer parses body too.
  form.append("greenFlags", "kind");
  form.append("redFlags", "rude");

  // Append image
  // form-data requires stream or buffer with filename options
  form.append("profilePics", fs.createReadStream(imagePath));

  console.log("\n[1] Requesting Signup OTP with Image...");
  try {
    let res = await fetch(`${BASE_URL}/signup/send-otp`, {
      method: "POST",
      body: form,
      // Headers managed by form-data
    });
    let data = await res.json();
    console.log("Status:", res.status, data);

    if (!data.success) {
      console.error("Signup Upload failed");
      return;
    }

    console.log(
      "Upload initiated successfully. Checking DB for verification would require login flow again.",
    );

    // Cleanup
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error("Test failed with error:", error);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }
}

runUploadTest();
