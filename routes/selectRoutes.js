import express from "express";
import {
  getStudenttByYearAndAcademicyear,
  getyearAndAcademicyear,
} from "../controllers/AdminController/studentController.js";

import {
  getAssessment,
  getAssessmentyearAndAcademicyear,
  getAssessmentByYearAndAcademicyear,
} from "../controllers/AdminController/resultsController.js";

import {
  getTimetableBYyearAndAcademicyear,
  getTimetableYearAndAcademicyear,
} from "../controllers/AdminController/timetableController.js";
const router = express.Router();

//student select routes
router.get("/", getyearAndAcademicyear);
router.get(
  "/getStudenttByYearAndAcademicyear/:year/:academicyear",
  getStudenttByYearAndAcademicyear
);

//assessment select routes
router.get("/getAssessment/:year/:academicyear", getAssessment);

// currently this routes not using i will implement in future it for edit
// router.get(
//   "/getAssessmentByYearAndAcademicyear/:year/:academicyear",
//   getAssessmentByYearAndAcademicyear
// );
router.get(
  "/getAssessmentyearAndAcademicyear",
  getAssessmentyearAndAcademicyear
);

//timetable routes
router.get("/getTimetableYearAndAcademicyear", getTimetableYearAndAcademicyear);
router.get(
  "/getTimetableBYyearAndAcademicyear/:year/:academicyear",
  getTimetableBYyearAndAcademicyear
);

export default router;
