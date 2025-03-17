import express from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from "../controllers/authController";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

router.post("/signup", catchAsync(register));
router.post("/login", catchAsync(login));
router.post("/refresh-token", catchAsync(refresh));
router.post("/logout", logout);
router.get("/me", catchAsync(getMe));

export default router;
