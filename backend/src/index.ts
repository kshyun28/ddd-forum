import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

const Errors = {
  UsernameAlreadyTaken: "UserNameAlreadyTaken",
  EmailAlreadyInUse: "EmailAlreadyInUse",
  ValidationError: "ValidationError",
  ServerError: "ServerError",
  ClientError: "ClientError",
  UserNotFound: "UserNotFound",
};

function parseUserForResponse(user: User) {
  const returnData = JSON.parse(JSON.stringify(user));
  delete returnData.password;
  return returnData;
}

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the DDD-Forum API",
  });
});

// Create a new user
app.post("/users/new", async (req: Request, res: Response) => {
  try {
    const { email, username, firstName, lastName } = req.body;

    console.log("Checking if username is already taken");
    const userWithSameUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (userWithSameUsername) {
      res.status(409).json({
        error: Errors.UsernameAlreadyTaken,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if email is already in use");
    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userWithSameEmail) {
      res.status(409).json({
        error: Errors.EmailAlreadyInUse,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if first name is valid");
    if (!firstName || firstName.length < 1 || typeof firstName !== "string") {
      res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if last name is valid");
    if (!lastName || lastName.length < 1 || typeof lastName !== "string") {
      res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Creating new user");
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
      },
    });
    res.status(201).json({
      error: undefined,
      data: parseUserForResponse(user),
      success: true,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "ServerError",
      data: undefined,
      success: false,
    });
    return;
  }
});

// Edit a user
app.post("/users/edit/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { email, username, firstName, lastName } = req.body;

    console.log("Checking if user exists");
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.status(404).json({
        error: Errors.UserNotFound,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if username is already taken");
    const userWithSameUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (userWithSameUsername && userWithSameUsername.id !== userId) {
      res.status(409).json({
        error: Errors.UsernameAlreadyTaken,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if email is already in use");
    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      res.status(409).json({
        error: Errors.EmailAlreadyInUse,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if first name is valid");
    if (!firstName || firstName.length < 1 || typeof firstName !== "string") {
      res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Checking if last name is valid");
    if (!lastName || lastName.length < 1 || typeof lastName !== "string") {
      res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log("Updating user");
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        username,
        firstName,
        lastName,
      },
    });
    res.json({
      error: undefined,
      data: parseUserForResponse(updatedUser),
      success: true,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: Errors.ServerError,
      data: undefined,
      success: false,
    });
    return;
  }
});

// Get a user by email
app.get("/users", async (req: Request, res: Response) => {
  try {
    // Handle emails with aliases (e.g. 'john+alias@gmail.com').
    // Email in query param should be encoded first.
    const email = decodeURIComponent(req.query.email as string);
    if (!email) {
      res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false,
      });
      return;
    }

    console.log(`Getting user with email ${email}`);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(404).json({
        error: Errors.UserNotFound,
        data: undefined,
        success: false,
      });
      return;
    }
    res.json({
      error: undefined,
      data: parseUserForResponse(user),
      success: true,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: Errors.ServerError,
      data: undefined,
      success: false,
    });
    return;
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
