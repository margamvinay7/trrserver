import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import {
  createAttendence,
  getAttendence,
  getAttendenceById,
  getAttendenceByIdAndDateRange,
  getAttendenceByIdAndMonth,
  getTotalAttendence,
} from "../controllers/AdminController/attendenceController.js";

const router = express.Router();
router.use(verifyJWT);

router.post("/", createAttendence);
router.get("/", getAttendence);
router.get("/getAttendenceById/:id", getAttendenceById);
router.get(
  "/getAttendenceByIdAndDateRange/:id/:startDate/:endDate",
  getAttendenceByIdAndDateRange
);

router.post("/getTotalAttendence", getTotalAttendence);
router.get(
  "/getAttendenceByIdAndMonth/:id/:month/:year",
  getAttendenceByIdAndMonth
);
export default router;
