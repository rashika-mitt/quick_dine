import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/user.js";
import jwt from "jsonwebtoken";

// Extend Express Request
export interface AuthRequest extends Request {
  user?: IUser | null;
}

// Protect routes: verify JWT and identify logged-in user
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If token is missing
  if (!token) {
    res.status(401).json({
      message: "Not authorized, no token",
    });
    return;
  }

  try {
    // Check JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        message: "JWT secret is missing",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    // Check token payload
    if (!decoded.id) {
      res.status(401).json({
        message: "Invalid token payload",
      });
      return;
    }

    // Find user from token
    const user = await User.findById(decoded.id).select("-password");

    // Check user
    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    // Attach user to request
    req.user = user;

    // Continue
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

// Admin-only access
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  }

  res.status(403).json({
    message: "Access denied, admin role required",
  });
};

// Restaurant owner or admin access
export const ownerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.user &&
    (req.user.role === "owner" || req.user.role === "admin")
  ) {
    next();
    return;
  }

  res.status(403).json({
    message: "Access denied, restaurant owner role required",
  });
};