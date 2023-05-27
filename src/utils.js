import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const createHash = (password) => {
  const saltRounds = 10; // Número de rondas para generar el salt
  return bcrypt.hashSync(password, saltRounds);
};

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);
