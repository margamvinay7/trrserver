import express from "express";
import {
  createResults,
  getResults,
} from "../controllers/AdminController/resultsController.js";

const router = express.Router();

router.post("/", createResults);
router.get("/", getResults);

export default router;
