import express from "express";
import {
  createResults,
  getResults,
  getAssessmentByYearAndIdAndAssesssment,
  getAssessmentList,
  getAssessmentById,
  deleteAssessment,
  updateAssessment,
  getResultByYearAndAcademicYearAndStudentId,
} from "../controllers/AdminController/resultsController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();
router.use(verifyJWT);
router.post("/", createResults);
router.get("/", getResults);
router.get(
  "/getAssessmentByYearAndIdAndAssesssment/:studentId/:year/:assessment",
  getAssessmentByYearAndIdAndAssesssment
);

router.post("/deleteAssessment", deleteAssessment);
router.post(
  "/getResultByYearAndAcademicYearAndStudentId",
  getResultByYearAndAcademicYearAndStudentId
);
router.patch("/updateAssessment/:id", updateAssessment);
router.get("/getAssessmentById/:id", getAssessmentById);
router.get(
  "/getAssessmentList/:year/:academicyear/:assessment",
  getAssessmentList
);

export default router;
