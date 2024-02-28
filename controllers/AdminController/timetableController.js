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
    res.status(200).send("table created");
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Year already present" });
  }
};

const updateTimetable = async (req, res) => {
  console.log("Entered in update timetable");
  try {
    const { id } = req.params; // Extract ID of the timetable to update
    const { year, academicyear, Days } = req.body;

    const timetable = await prisma.timetable.findUnique({
      where: { id: id },
      include: {
        Days: { include: { Periods: true } },
      },
    });

    if (!timetable) {
      throw new Error("Timetable not found");
    }

    // Delete related Periods
    await prisma.periods.deleteMany({
      where: {
        daysId: {
          in: timetable.Days.map((day) => day.id), // Get all Days IDs related to the timetable
        },
      },
    });

    // Delete related Days
    await prisma.days.deleteMany({
      where: {
        timetableId: id,
      },
    });

    // Delete the timetable itself
    await prisma.timetable.delete({
      where: { id: id },
    });

    // if (!existingTimetable) {
    //   return res.status(404).json({ error: "Timetable not found" });
    // }
    const createdTimetable = await prisma.timetable.create({
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
    res.status(200).send("table created");
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({ error: "Internal server error" });
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

const getTimetableYear = async (req, res) => {
  try {
    const years = await prisma.timetable.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
    });

    years.map((year) => year.year);
    res.json({ years });
  } catch (error) {
    console.log("error", error);
  }
};

const getTimetableByYear = async (req, res) => {
  const { year } = req.params;
  try {
    const timetable = await prisma.timetable.findMany({
      where: {
        year: year,
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
  }
};

export {
  createTimetable,
  getTimetable,
  getTimetableBYyearAndAcademicyear,
  getTimetableYearAndAcademicyear,
  getTimetableYear,
  getTimetableByYear,
  updateTimetable,
};
