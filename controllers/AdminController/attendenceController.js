import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

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

export { createAttendence, getAttendence };
