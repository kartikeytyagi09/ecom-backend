import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AddressSchema = z.object({
  lineOne: z.string().min(1, "Address line 1 is required"),
  lineTwo: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.number().max(999999, "Invalid pincode"),
  userId: z.number(),
});
