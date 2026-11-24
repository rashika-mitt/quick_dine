
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";

// JWT payload/user info attached by auth middleware
interface AuthRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

// ========================================
// Register User
// POST /api/auth/register
// ========================================
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please enter all required details",
      });
      return;
    }

    // Validate password
    const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must contain at least 8 characters, one number and one special character.",
      });
      return;
    }

    // Validate phone number if provided
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      res.status(400).json({
        message: "Please enter a valid international phone number.",
      });
      return;
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      res.status(409).json({
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || undefined,
      role: role === "owner" ? "owner" : "user",
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error: any) {
    console.error("Register error:", error);

    // Duplicate email error
    if (error.code === 11000) {
      res.status(409).json({
        message: "Email already registered",
      });
      return;
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ========================================
// Login User
// POST /api/auth/login
// ========================================
export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Please enter email and password",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id.toString());

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      });
      return;
    }

    res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ========================================
// Get User Profile
// GET /api/auth/me
// Protected Route
// ========================================
export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    const userId = authReq.user?.id || authReq.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "Not authorized",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
