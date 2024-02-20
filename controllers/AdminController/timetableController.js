import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

const createTimetable = async (req, res) => {
  console.log("entered in create timetable");
  try {
    const { year, academicyear, Days } = req.body;

    const timetable = await prisma.timetable.create({
      data: {
        year,
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
    res.send("table created");
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Year already present" });
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

const getTimetableBYyearAndAcademicyear = async (req, res) => {
  const { year, academicyear } = req.params;
  try {
    const timetable = await prisma.timetable.findMany({
      where: {
        year,
        academicyear,
      },
      include: {
        Days: {
          include: {
            Periods: true,
          },
        },
      },
    });
    res.json(timetable);
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error.message);
  }
};

const getTimetableYearAndAcademicyear = async (req, res) => {
  try {
    const years = await prisma.timetable.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
    });
    const academicyears = await prisma.timetable.findMany({
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

export {
  createTimetable,
  getTimetable,
  getTimetableBYyearAndAcademicyear,
  getTimetableYearAndAcademicyear,
};
