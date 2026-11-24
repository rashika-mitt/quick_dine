
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "admin" | "owner";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long."],
      match: [
        /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must contain at least 8 characters, one number and one special character.",
      ],
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) =>
          !value || /^\+[1-9]\d{7,14}$/.test(value),
        message: "Please enter a valid international phone number.",
      },
    },

    role: {
      type: String,
      enum: ["user", "admin", "owner"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Remove password from JSON response
userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    return ret;
  },
});

export const User = model<IUser>("User", userSchema);
