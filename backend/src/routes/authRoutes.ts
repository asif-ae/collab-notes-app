import express from "express";
import {
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

export default router;
