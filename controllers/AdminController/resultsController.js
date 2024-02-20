import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

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

const getAssessment = async (req, res) => {
  const year = req.params.year;
  const academicyear = req.params.academicyear;
  try {
    const assessmentsData = await prisma.assessment.findMany({
      where: {
        year: year,
        academicyear: academicyear,
      },
      select: {
        assessment: true,
      },
      distinct: ["assessment"],
    });

    const assessments = assessmentsData.map((entry) => entry.assessment);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching distinct assessments:", error);
  }
};

const getAssessmentyearAndAcademicyear = async (req, res) => {
  try {
    const years = await prisma.assessment.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
    });
    const academicyears = await prisma.assessment.findMany({
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

const getAssessmentByYearAndAcademicyear = async (req, res) => {
  const year = req.params.year;
  const academicyear = req.params.academicyear;
  // const { year, academicyear } = req.params;
  console.log("year", year, "academicyear", academicyear);
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        year: year,
        academicyear: academicyear,
      },

      // include: {
      //   AssessmentSubject:true
      // },
    });

    res.json(assessments);
  } catch (error) {
    console.log(error);
  }
};

export {
  createResults,
  getResults,
  getAssessment,
  getAssessmentyearAndAcademicyear,
  getAssessmentByYearAndAcademicyear,
};
