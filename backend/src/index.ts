import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

// Create a new user
app.post("/users/new", async (req: Request, res: Response) => {
  const { email, username, firstName, lastName } = req.body;
  const user = await prisma.user.create({
    data: {
      email,
      username,
      firstName,
      lastName,
    },
  });
  res.status(201).json(user);
});

// Edit a user
app.post("/users/edit/:userId", async (req: Request, res: Response) => {
  // ...
});

// Get a user by email
app.get("/users", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.query.email as string,
    },
  });
  res.json(user);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
