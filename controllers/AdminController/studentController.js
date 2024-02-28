import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

import { promises as fs } from "fs";

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
      id: row.RollNo.toString(),

      fullName: row.FullName.toString(),
      email: row.Email.toString(),
      gender: row.Gender.toString(),
      mobile: row.Mobile?.toString(),
      joiningyear: row.Joiningyear?.toString(),
      address: row.Address?.toString(),
      // image: fs.readFile(row?.Image, { encoding: "base64" })?.toString(),
      year: row.Year.toString(), // Assuming years are comma-separated in the Excel sheet
      academicyear: row.Academicyear.toString(),
      // Assuming academicYears are comma-separated in the Excel sheet
    }));

    for (const student of studentData) {
      await prisma.student.upsert({
        where: { id: student.id },
        update: student,
        create: student,
      });
    }
    res.status(200).send("ok");
    console.log("response data");
  } catch (error) {
    console.error("Error :", error);
    res.status(500).send(error);
  }
};

const updateStudent = async (req, res) => {
  const formData = req.body;
  try {
    const {
      id,
      fullName,
      email,
      mobile,
      gender,
      year,
      joiningyear,
      address,
      image,
      academicyear,
    } = formData;

    console.log(image);

    const existingStudent = await prisma.student.findUnique({
      where: {
        id,
      },
    });

    const imageData = Buffer.from(image, "base64");

    let updatedStudent;
    // let imageData = null;
    // if (image) {
    //   if (!req.files || !req.files.image) {
    //     console.log("image not found");
    //   }
    //   const imageFile = req.files.image;
    //   imageData = imageFile.data.toString("base64");
    //   console.log("ima", imageData);
    // }

    if (existingStudent) {
      // Update the existing student
      updatedStudent = await prisma.student.update({
        where: {
          id,
        },
        data: {
          fullName,

          email,
          mobile,
          gender,
          year,
          joiningyear,
          address,
          image: imageData || existingStudent.image,
          academicyear,
        },
      });
    } else {
      // Create a new student
      updatedStudent = await prisma.student.create({
        data: {
          id,
          fullName,

          email,
          mobile,
          gender,
          year,
          joiningyear,
          address,
          image: imageData,
          academicyear,
        },
      });
    }

    res.status(200).json({
      message: "Student data updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.log(error);
  }
};

const getyearAndAcademicyear = async (req, res) => {
  console.log("in year adn academic year");
  try {
    const years = await prisma.student.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
    });
    const academicyears = await prisma.student.findMany({
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

const getStudentByYearAndAcademicyear = async (req, res) => {
  console.log("in by");
  const year = req.params.year;
  const academicyear = req.params.academicyear;
  // const { year, academicyear } = req.params;
  console.log("year", year, "academicyear", academicyear);
  try {
    const students = await prisma.student.findMany({
      where: {
        year: year,
        academicyear: academicyear,
      },
    });

    res.json(students);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const getStudents = async (req, res) => {
  console.log("entered get students");
  try {
    const allStudents = await prisma.student.findMany({
      include: {
        Assessment: {
          include: {
            AssessmentSubject: true,
          },
        },
        Attendence: {
          include: {
            Subject: true,
          },
        },
      },
    });

    res.json(allStudents);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
    });
    res.json(student);
  } catch (error) {
    console.log(error);
  }
};

export {
  createStudents,
  getStudents,
  getStudentByYearAndAcademicyear,
  getyearAndAcademicyear,
  getStudentById,
  updateStudent,
};
