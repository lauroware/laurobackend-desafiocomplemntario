import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const PRIVATE_KEY = "marvel";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const createHash = (password) => {
  const saltRounds = 10; // Número de rondas para generar el salt
  return bcrypt.hashSync(password, saltRounds);
};

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

export const generateToken = (user) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "24h" });
  return token;
};

export const authToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) token = req.cookies["marvel"];
  if (!token) return res.status(401).json({ error: "Not auth" });
  jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
    if (error) return res.status(403).json({ error: "Not authorized" });
    req.user = credentials.user;
    next();
  });
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    console.log(req.user);
    if (req.user.user.role != role)
      return res.status(403).json({ error: "No permission" });
    next();
  };
};
