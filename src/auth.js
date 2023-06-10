import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import userModel from "../dao/models/user.model.js";
import jwt from "jsonwebtoken";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await userModel.findOne({ username });

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Contraseña incorrecta" });
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
