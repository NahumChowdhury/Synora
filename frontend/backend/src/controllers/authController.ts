import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

export const register = async (
  req: Request,
  res: Response
) => {  console.log("REGISTER FUNCTION HIT");
  try {
    const { email, password } = req.body;
console.log("REGISTER REQUEST:", req.body);

    console.log("REGISTER REQUEST:", email);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log("EXISTING USER:", existingUser);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    console.log("USER CREATED:", user);

    return res.status(201).json({
      message: "Registration successful",
      userId: user.id,
    });
  } catch (error) {
    console.log("========== REGISTER ERROR ==========");
    console.error(error);
    console.log("===================================");

    return res.status(500).json({
      message: "Server Error",
    });
  }
};