#!/usr/bin/env node

import { config } from "dotenv";
config();
import { Command } from "commander";
import prompt from "prompt-sync";
import { generatePassword, saveMasterPassword, verifyMasterPassword } from "./utils/bcrypt";
import { loadVault, saveVault } from "./utils/vault";
import { decryptPassword, encryptPassword } from "./utils/crypto";
import fs from "fs-extra";

const MASTER_HASH_PATH = process.env.MASTER_HASH_PATH!;

const program = new Command();
const input = prompt();

program
  .command("init")
  .description("Initialize the vault with a master password")
  .action(async () => {
    const masterPassword = input("Set a master password: ", { echo: "*" });
    try {
      const hashedPassword = await fs.readFile(MASTER_HASH_PATH, "utf8");
      if (hashedPassword) {
        console.log("vault already initialized sir");
        return;
      }
    } catch (error) {
      await saveMasterPassword(masterPassword);
      console.log("Vault initialized.");
    }
  });

program
  .command("get <name>")
  .description("Retrieve a password")
  .action(async (name) => {
    const masterPassword = input("Enter master password: ", { echo: "*" });
    if (await verifyMasterPassword(masterPassword)) {
      const vault = await loadVault();
      if (vault[name]) {
        const password = decryptPassword(vault[name], masterPassword);
        console.log(`Password for ${name}: ${password}`);
      } else {
        console.error(`No password found for ${name}.`);
      }
    } else {
      console.error("Invalid master password.");
    }
  });

program
  .command("generate")
  .description("Generate a strong random password")
  .option("-l, --length <number>", "Length of the password", "16")
  .action(async (options) => {
    const length = parseInt(options.length, 10);
    if (isNaN(length) || length < 8) {
      console.error("Password length must be a number and at least 8.");
      return;
    }
    const password = generatePassword(length);
    console.log(`Generated Password: ${password}`);
  });

program
  .command("set <name>")
  .description("Set a password (auto-generate if not provided)")
  .option("-g, --generate", "Auto-generate a strong password")
  .option("-l, --length <number>", "Length of the generated password", "16")
  .action(async (name, options) => {
    const masterPassword = input("Enter master password: ", { echo: "*" });
    if (await verifyMasterPassword(masterPassword)) {
      const vault = await loadVault();
      if (vault[name]) {
        console.log("password for this already exist");
        return;
      }
      const password = options.generate
        ? generatePassword(parseInt(options.length, 10))
        : input("Enter password: ", { echo: "*" });
      if (password.length < 8) {
        console.log("password is weak just like you ");
        return;
      }
      vault[name] = encryptPassword(password, masterPassword);
      await saveVault(vault);
      console.log(`Password for ${name} stored.`);
      if (options.generate) {
        console.log(`Generated Password: ${password}`);
      }
    } else {
      console.error("Invalid master password.");
    }
  });

program.parse(process.argv);
