import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

const createAttendence = async (req, res) => {
  try {
    const attendenceData = req.body;

    for (const studentAttendece of attendenceData) {
      const { studentId, date, subjects, year, academicyear } =
        studentAttendece;

      // console.log(date, year, academicyear);
      const isExist = await prisma.attendence.findMany({
        where: {
          date: date,
          year: year,
          academicyear: academicyear,
        },
      });

      // console.log(isExist);

      if (isExist.length !== 0) {
        return res.status(208).send({ message: "Attendence already marked" });
      } else {
        // console.log("subjects", subjects);
        const attendence = await prisma.attendence.create({
          data: {
            studentId,
            date,
            year,
            academicyear,
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
        return res.status(200).send("attendence updated");
      }
    }
  } catch (error) {
    // console.log("error", error);
    res.status(500).send("error occured");
  }
};

const getTotalAttendence = async (req, res) => {
  const { studentId, year } = req.body;
  // console.log("st", req.body);

  const resdata = [];
  try {
    for (let i = 0; i < year.length; i++) {
      const attendance = await prisma.attendence.findMany({
        where: {
          studentId: studentId,
          year: year[i],
        },
        include: {
          Subject: true,
        },
      });
      // console.log("at", attendance);
      let totalSubjectsCount = 0;

      // Assuming attendance is an array of attendance records
      attendance.forEach((record) => {
        totalSubjectsCount += record.Subject.length;
        // console.log("tot", totalSubjectsCount);
      });
      let academicyear;
      let totalPresentSubjectsCount = 0;

      // Assuming attendance is an array of attendance records
      attendance.forEach((record) => {
        academicyear = record.academicyear;
        record.Subject.forEach((subject) => {
          if (subject.present) {
            totalPresentSubjectsCount++;
            // console.log("toop", totalPresentSubjectsCount);
          }
        });
      });

      resdata.push({
        year: year[i],
        totalSubjectsCount,
        totalPresentSubjectsCount,
        academicyear: academicyear,
      });
    }
    // console.log("rea", resdata);
    res.json(resdata);
  } catch (error) {
    // console.log(error);
    res.status(500).json(error);
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

const getAttendenceById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await prisma.student.findUnique({
      where: {
        id: id,
      },
      include: {
        Attendence: {
          include: {
            Subject: true,
          },
        },
      },
    });

    res.json(response);
  } catch (error) {
    console.log("error", error);
  }
};

const getAttendenceByIdAndDateRange = async (req, res) => {
  const { id } = req.params;
  let { startDate, endDate } = req.params;
  console.log("dates", startDate, endDate);
  // Helper function to format date strings from DD-MM-YYYY to YYYY-MM-DD , i will use if it needed
  // const formatDate = (dateString) => {
  //   const [day, month, year] = dateString.split("-");
  //   return `${year}-${month}-${day}`;
  // };

  // Convert date strings to ISO 8601 format (YYYY-MM-DD)
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  endDate.setHours(23, 59, 59, 999);

  try {
    const response = await prisma.attendence.findMany({
      where: {
        studentId: id, // Filter by student ID if needed
        date: {
          gte: startDate, // Greater than or equal to start date
          lte: endDate, // Less than or equal to end date
        },
      },
      include: {
        Subject: true,
      },
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Error fetching attendance" });
  }
};

const getAttendenceByIdAndMonth = async (req, res) => {
  const { id, month, year } = req.params;

  // Calculate start and end dates based on month and year
  const startDate = new Date(year, month - 1, 1); // Month is zero-based
  const endDate = new Date(year, month, 0); // Last day of the month

  console.log("dates ", startDate, endDate);

  try {
    const attendance = await prisma.attendence.findMany({
      where: {
        studentId: id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        Subject: true,
      },
    });

    const subjectCounts = {};
    const presentSubjectCounts = {};
    attendance.forEach((record) => {
      record.Subject.forEach((subject) => {
        subjectCounts[subject.subject] =
          (subjectCounts[subject.subject] || 0) + 1;
        if (subject.present) {
          presentSubjectCounts[subject.subject] =
            (presentSubjectCounts[subject.subject] || 0) + 1;
        }
      });
    });

    const subjectPercentages = {};
    for (const subject in subjectCounts) {
      const totalCount = subjectCounts[subject] || 0;
      const presentCount = presentSubjectCounts[subject] || 0;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      subjectPercentages[subject] = percentage.toFixed(2); // Round to 2 decimal places
    }

    res.json([subjectCounts, presentSubjectCounts, subjectPercentages]);
    // res.json(response);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Error fetching attendance" });
  }
};

// const getAttendenceTimetableByYear=async()=>{

//   try{
//     const response=await prisma.timetable.findMany
//   }
// }

export {
  createAttendence,
  getAttendence,
  getAttendenceById,
  getAttendenceByIdAndDateRange,
  getAttendenceByIdAndMonth,
  getTotalAttendence,
};
