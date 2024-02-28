import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import jwt from "jsonwebtoken";

const login = async (req, res) => {
  const { username, password } = req.body;
  console.log("use", username, password);
  const secret = "jhdfhuheruhuurehhjldu";
  try {
    const admin = await prisma.admin.findUnique({
      where: {
        username: username,
      },
    });

    if (admin) {
      if (admin.password === password) {
        console.log("admin authenticated");
        const accessToken = jwt.sign(
          {
            UserInfo: {
              user: username,
              roles: "admin",
            },
          },
          secret,
          { expiresIn: "5h" }
        );
        res.json({ accessToken });
      } else {
        res.status(404).send("password wrong");
      }
    } else {
      const studentUser = await prisma.student.findUnique({
        where: {
          id: username,
        },
      });

      if (studentUser) {
        if (!studentUser) {
          res.status(404).send("user not found");
        }
        if (studentUser.id === password) {
          console.log("student authenticated");
          const accessToken = jwt.sign(
            {
              UserInfo: {
                user: username,
                roles: "student",
              },
            },
            secret,
            { expiresIn: "5h" }
          );
          res.json({ accessToken });
        } else {
          res.status(404).send("password wrong");
        }
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

export { login };
