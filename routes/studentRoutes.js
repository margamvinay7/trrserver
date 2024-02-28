import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import {
  createStudents,
  getStudents,
  getStudentById,
  updateStudent,
} from "../controllers/AdminController/studentController.js";

const router = express.Router();
router.use(verifyJWT);
router.post("/", createStudents);
router.get("/", getStudents);
router.get("/getStudentById/:id", getStudentById);
router.put("/updateStudent/", updateStudent);
export default router;
