import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import fileUpload from "express-fileupload";
import xlsx from "xlsx";
import errorHandler from "./middleware/errorHandler.js";
// import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoute.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import attendenceRoutes from "./routes/attendenceRoutes.js";
import selectRoutes from "./routes/selectRoutes.js";

import loginRoutes from "./routes/loginRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// app.get("/", (req, res) => {
//   res.send("hi vinay");
// });
// app.use("/", adminRoutes);
app.use("/login", loginRoutes);
app.use("/", studentRoutes);

app.use("/result", resultRoutes);

app.use("/timetable", timetableRoutes);
app.use("/attendence", attendenceRoutes);
app.use("/select", selectRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
