import express from "express";
import {
  createTimetable,
  getTimetable,
} from "../controllers/AdminController/timetableController.js";

const router = express.Router();
router.get("/", getTimetable);
router.post("/", createTimetable);

export default router;
