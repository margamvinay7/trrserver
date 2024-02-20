import express from "express";
import {
  createAttendence,
  getAttendence,
} from "../controllers/AdminController/attendenceController.js";

const router = express.Router();

router.post("/", createAttendence);
router.get("/", getAttendence);

export default router;
