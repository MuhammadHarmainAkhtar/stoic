import bcrypt from "bcrypt";
import { createHmac } from "crypto";

export const doHash = async (value: string, saltValue: number) => {
  const result = await bcrypt.hash(value, saltValue);
  return result;
};

export const doHashValidation = async (value: string, hashedValue: string) => {
  const result = await bcrypt.compare(value, hashedValue);
  return result;
};

export const hmacProcess = (value: string, key: string) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
