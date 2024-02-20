import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
const prisma = new PrismaClient();
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
const createTimetable = async (req, res) => {
  console.log("entered in create timetable");
  try {
    const { id, academicyear, Days } = req.body;

    const timetable = await prisma.timetable.create({
      data: {
        id,
        academicyear,
        Days: {
          create: Days.map((day) => ({
            day: day.day,
            Periods: {
              create: day.Periods.map((period) => ({
                time: period.time,
                subject: period.subject,
              })),
            },
          })),
        },
      },
      include: {
        Days: {
          include: {
            Periods: true,
          },
        },
      },
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).send("Internal Error");
  }
};
const getTimetable = async (req, res) => {
  const timetable = await prisma.timetable.findMany({
    include: {
      Days: {
        include: {
          Periods: true,
        },
      },
    },
  });

  res.json(timetable);
};
const createResults = async (req, res) => {
  console.log("entered create results");
  try {
    const excelFile = req.files?.excelFile;
    const workbook = xlsx.read(excelFile?.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const { assessment, studentId, subjectCount, year, academicyear } = row;
      console.log("rows", row);
      let subjects = [];
      console.log(row["subject1"]);
      for (let i = 1; i <= subjectCount; i++) {
        let subject = row[`subject${i}`];
        console.log("current subject", subject);
        let theoryMarks = parseInt(row[`theoryMarks${i}`]);
        let practicalMarks = parseInt(row[`practicalMarks${i}`]);

        subjects.push({
          subject: subject,
          theoryMarks: theoryMarks,
          practicalMarks: practicalMarks,
        });
      }

      console.log("subject array", subjects);
      await prisma.assessment.create({
        data: {
          assessment,
          studentId,
          year,
          academicyear,
          AssessmentSubject: {
            createMany: {
              data: subjects,
            },
          },
        },
        include: {
          AssessmentSubject: true,
        },
      });
    }
    console.log("results created");
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error.message);
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
const getResults = async (req, res) => {
  console.log("entered get students");
  try {
    const allStudents = await prisma.assessment.findMany({
      include: {
        AssessmentSubject: true,
      },
    });

    res.json(allStudents);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
};
const createAttendence = async (req, res) => {
  try {
    const attendenceData = req.body;

    for (const studentAttendece of attendenceData) {
      const { studentId, date, subjects } = studentAttendece;
      console.log("subjects", subjects);
      const attendence = await prisma.attendence.create({
        data: {
          studentId,
          date,
          Subject: {
            create: subjects?.map((subject) => ({
              time: subject.time,
              subject: subject.subject,
              present: subject.present,
            })),
          },
        },
        include: {
          Subject: true,
        },
      });
    }
    res.status(200).send("attendence updated");
  } catch (error) {
    console.log("error", error);
    res.status(500).send("error occured");
  }
};
const getAttendence = async (req, res) => {
  try {
    const response = await prisma.attendence.findMany({
      include: {
        Subject: true,
      },
    });

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("error internal error");
  }
};
export {
  createStudents,
  getStudents,
  createResults,
  getResults,
  createTimetable,
  getTimetable,
  createAttendence,
  getAttendence,
  getyearAndAcademicyear,
  getStudenttByYearAndAcademicyear,
};
