import { z } from "zod";


export const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().refine((val) => !isNaN(Number(val)), {
      message: "Price must be a valid number",
    }),
    tags: z.string().optional(),
});
