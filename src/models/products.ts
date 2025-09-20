import { z } from "zod";


export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number("Price must be a number"),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});