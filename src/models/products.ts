import { z } from "zod";


export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number("Price must be a number"),
  stock: z.number().int().min(0).default(0),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});