import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

const createStudents = async (req, res) => {
  console.log("entered here");
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded");
    }
    const excelFile = req.files.excelFile;
    const workbook = xlsx.read(excelFile.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log("exceldata", data);
    const studentData = data.map((row) => ({
      id: row.id.toString(),

      fullName: row.fullName,
      email: row.email,
      gender: row.gender,
      mobile: row.mobile?.toString(),
      // rollNo: row?.rollNo,
      year: { create: row.year?.split(",").map((year) => ({ year })) }, // Assuming years are comma-separated in the Excel sheet
      academicyear: {
        create: row.academicyear
          ?.split(",")
          .map((academicyear) => ({ academicyear })),
      }, // Assuming academicYears are comma-separated in the Excel sheet
    }));

    for (const student of studentData) {
      await prisma.student.upsert({
        where: { id: student.id },
        update: student,
        create: student,
      });
    }

    console.log("response data");
  } catch (error) {
    console.error("Error :", error);
    res.status(500).send(error);
  }
};

const getyearAndAcademicyear = async (req, res) => {
  try {
    const years = await prisma.year.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
    });
    const academicyears = await prisma.academicyear.findMany({
      select: {
        academicyear: true,
      },
      distinct: ["academicyear"],
    });

    years.map((year) => year.year);
    academicyears.map((academicyear) => academicyear.academicyear);

    res.json({ years, academicyears });
  } catch (error) {
    console.log("error", error);
  }
};

const getStudenttByYearAndAcademicyear = async (req, res) => {
  const year = req.params.year;
  const academicyear = req.params.academicyear;
  // const { year, academicyear } = req.params;
  console.log("year", year, "academicyear", academicyear);
  try {
    const students = await prisma.student.findMany({
      where: {
        year: {
          some: {
            year: year,
          },
        },
        academicyear: {
          some: {
            academicyear: academicyear,
          },
        },
      },
      include: {
        year: true,
        academicyear: true,
      },
    });

    res.json(students);
  } catch (error) {
    console.log(error);
  }
};

const getStudents = async (req, res) => {
  console.log("entered get students");
  try {
    const allStudents = await prisma.student.findMany({
      include: {
        year: true,
        academicyear: true,
      },
    });

    res.json(allStudents);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
};

export {
  createStudents,
  getStudents,
  getStudenttByYearAndAcademicyear,
  getyearAndAcademicyear,
};
