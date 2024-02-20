import express from "express";
import {
  createStudents,
  getStudents,
} from "../controllers/AdminController/studentController.js";

const router = express.Router();

router.post("/", createStudents);
router.get("/", getStudents);

export default router;
