import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_KEY; 

// Encrypt function
export const encryptMessage = (text) => {
    const iv = crypto.randomBytes(16); // Generate IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
    
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    
    return `${iv.toString("hex")}:${encrypted}`; // Store IV with encrypted text
};

// Decrypt function
export const decryptMessage = (encryptedText) => {
    const [ivHex, encrypted] = encryptedText.split(":");
    const ivBuffer = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), ivBuffer);
    
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    
    return decrypted;
};
