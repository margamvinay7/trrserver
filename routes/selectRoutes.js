import express from "express";
import {
  getStudentByYearAndAcademicyear,
  getyearAndAcademicyear,
} from "../controllers/AdminController/studentController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import {
  getAssessment,
  getAssessmentyearAndAcademicyear,
  getAssessmentByYearAndAcademicyear,
  getAssessmentsYearAndId,
} from "../controllers/AdminController/resultsController.js";

import {
  getTimetableBYyearAndAcademicyear,
  getTimetableYearAndAcademicyear,
  getTimetableYear,
  getTimetableByYear,
} from "../controllers/AdminController/timetableController.js";
const router = express.Router();
router.use(verifyJWT);
//student select routes
router.get("/", getyearAndAcademicyear);
router.get(
  "/getStudentByYearAndAcademicyear/:year/:academicyear",
  getStudentByYearAndAcademicyear
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
router.get(
  "/getAssessmentsYearAndId/:studentId/:year",
  getAssessmentsYearAndId
);

//timetable routes
router.get("/getTimetableYearAndAcademicyear", getTimetableYearAndAcademicyear);
router.get(
  "/getTimetableBYyearAndAcademicyear/:year/:academicyear",
  getTimetableBYyearAndAcademicyear
);
router.get("/getTimetableYear", getTimetableYear);
router.get("/getTimetableByYear/:year", getTimetableByYear);

export default router;
