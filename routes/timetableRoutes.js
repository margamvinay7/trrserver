import express from "express";

import {
  createTimetable,
  getTimetable,
  updateTimetable,
} from "../controllers/AdminController/timetableController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();
router.use(verifyJWT);
router.get("/", getTimetable);
router.post("/", createTimetable);
router.post("/updateTimetable/:id", updateTimetable);

export default router;
