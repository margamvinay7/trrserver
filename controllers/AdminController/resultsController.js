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
    console.log(jsonData);
    for (const row of jsonData) {
      const {
        Assessment,
        RollNo,
        SubjectCount,
        Year,
        Academicyear,
        StudentName,
        Status,
      } = row;
      const response = await prisma.assessment.findMany({
        where: {
          studentId: RollNo.toString(),
          year: Year.toString(),
          academicyear: Academicyear.toString(),
          assessment: Assessment.toString(),
        },
      });

      console.log("rows", row);
      let subjects = [];

      for (let i = 1; i <= SubjectCount; i++) {
        let subject = row[`Department${i}`];

        let theoryMarks = parseInt(row[`Theory${i}`]);
        let practicalMarks = parseInt(row[`Practical${i}`]);

        subjects.push({
          subject: subject.toString(),
          theoryMarks: theoryMarks,
          practicalMarks: practicalMarks,
        });
      }

      console.log("subject array", subjects);
      await prisma.assessment.create({
        data: {
          assessment: Assessment.toString(),
          studentId: RollNo.toString(),
          year: Year.toString(),
          academicyear: Academicyear.toString(),
          studentName: StudentName?.toString(),
          status: Status?.toString(),
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
    res.status(200).send("ok");
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error.message);
  }
};

const deleteAssessment = async (req, res) => {
  const { year, academicyear, assessment } = req.body;
  try {
    const response = await prisma.assessment.findMany({
      where: {
        year,
        academicyear,
        assessment,
      },
    });

    await prisma.assessmentSubject.deleteMany({
      where: {
        assessmentId: response?.id,
      },
    });

    await prisma.assessment.delete({
      where: {
        id: response?.id,
      },
    });

    res.status(200).send("Assessment deleted Successfully");
  } catch (error) {
    console.log("error", error);
    res.status(500).send("An error occurred while deleting assessment");
  }
};

const updateAssessment = async (req, res) => {
  const { id } = req.params;
  const { AssessmentSubject } = req.body;
  console.log("ass", AssessmentSubject);
  try {
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id: id,
      },
    });
    const updatedAssessment = await prisma.assessment.update({
      where: {
        id: existingAssessment.id,
      },
      data: {
        AssessmentSubject: {
          updateMany: AssessmentSubject.map((subject) => ({
            where: { id: subject.id },
            data: {
              subject: subject.subject,
              theoryMarks: parseInt(subject.theoryMarks),
              practicalMarks: parseInt(subject.practicalMarks),
            },
          })),
        },
      },
    });

    res.status(200).json(updateAssessment);
  } catch (error) {
    console.log(error);
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

const getAssessmentList = async (req, res) => {
  const { year, academicyear, assessment } = req.params;
  console.log("in ", year, assessment, academicyear);
  try {
    const assessmentsList = await prisma.assessment.findMany({
      where: {
        year: year,
        academicyear: academicyear,
        assessment: assessment,
      },

      include: {
        AssessmentSubject: true,
      },
    });

    res.json(assessmentsList);
  } catch (error) {
    console.log("error", error);
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

//this for edit the assessments it should have to modified and based on assessment
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

const getAssessmentByYearAndIdAndAssesssment = async (req, res) => {
  const { studentId, year, assessment } = req.params;
  try {
    const marks = await prisma.assessment.findMany({
      where: {
        studentId: studentId,
        year: year,
        assessment: assessment,
      },
      include: {
        AssessmentSubject: true,
      },
    });

    res.json(marks);
  } catch (error) {
    console.log("error", error);
  }
};

const getAssessmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: id,
      },
      include: {
        AssessmentSubject: true,
      },
    });

    res.json(assessment);
  } catch (error) {
    console.log(error);
  }
};

const getAssessmentsYearAndId = async (req, res) => {
  const { studentId, year } = req.params;
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        year,
        studentId,
      },
      distinct: ["assessment"], // Specify the field to make distinct
      select: {
        assessment: true, // Select the assessment field
      },
    });

    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw error;
  }
};

const getResultByYearAndAcademicYearAndStudentId = async (req, res) => {
  const { year, studentId, assessment } = req.body;
  console.log("rb", req.body, year, studentId, assessment);

  try {
    const response = await prisma.assessment.findMany({
      where: {
        studentId,
        year: {
          in: year, // Array of year values
        },
        assessment,
      },
    });
    // console.log("result found", response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(304).send("not found");
  }
};

export {
  createResults,
  getResults,
  updateAssessment,
  getAssessment,
  deleteAssessment,
  getAssessmentById,
  getAssessmentList,
  getAssessmentyearAndAcademicyear,
  getAssessmentByYearAndAcademicyear,
  getAssessmentsYearAndId,
  getAssessmentByYearAndIdAndAssesssment,
  getResultByYearAndAcademicYearAndStudentId,
};
