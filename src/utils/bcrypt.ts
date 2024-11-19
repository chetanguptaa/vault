import * as bcrypt from "bcryptjs";
import fs from "fs-extra";

const MASTER_HASH_PATH = "./master.hash";

export const saveMasterPassword = async (password: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await fs.writeFile(MASTER_HASH_PATH, hashedPassword);
};

export const verifyMasterPassword = async (password: string): Promise<boolean> => {
  const hashedPassword = await fs.readFile(MASTER_HASH_PATH, "utf8");
  return await bcrypt.compare(password, hashedPassword);
};

export const generatePassword = (length: number = 16): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*()_+[]{}<>?";
  const allChars = uppercase + lowercase + digits + specialChars;
  const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const passwordArray = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(digits),
    getRandomChar(specialChars),
  ];
  while (passwordArray.length < length) {
    passwordArray.push(getRandomChar(allChars));
  }
  return passwordArray.sort(() => Math.random() - 0.5).join("");
};
