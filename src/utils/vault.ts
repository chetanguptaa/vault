import { config } from "dotenv";
config();
import fs from "fs-extra";

const VAULT_PATH = process.env.VAULT_PATH!;

export const loadVault = async (): Promise<Record<string, string>> => {
  if (await fs.pathExists(VAULT_PATH)) {
    return await fs.readJson(VAULT_PATH);
  } else {
    return {};
  }
};

export const saveVault = async (vault: Record<string, string>): Promise<void> => {
  await fs.writeJson(VAULT_PATH, vault, { spaces: 2 });
};
