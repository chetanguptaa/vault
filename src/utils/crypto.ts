import * as crypto from "crypto";

export const deriveKeyAndIv = (masterPassword: string) => {
  const key = crypto.createHash("sha256").update(masterPassword).digest();
  const iv = crypto.randomBytes(16);
  return { key, iv };
};

export const encryptPassword = (plaintext: string, masterPassword: string): string => {
  const { key, iv } = deriveKeyAndIv(masterPassword);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decryptPassword = (ciphertext: string, masterPassword: string): string => {
  const [ivHex, encryptedHex] = ciphertext.split(":");
  const { key } = deriveKeyAndIv(masterPassword);
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
};
