const { z } = require('zod');

const productSchema = z.object({
    title: z.string()
    .min(3, "Title must be at least 3 characters long")
    .max(20, "Title must be at most 20 characters long"),

    description: z.string()
    .min(10, "Description must be at least 10 characters long")
    .max(255, "Description must be at most 100 characters long"),

    price: z.coerce.number()
    .positive("Price must be a positive number")
    .max(1000000, "Price must be less than 1,000,000"),

    full_description: z.string()
    .min(10, "Full description must be at least 10 characters long")
    .max(1000, "Full description must be at most 1000 characters long"),

    category: z.string().min(2, "Укажите категорию").optional(),

    raiting: z.coerce.number()
    .min(0)
    .max(5)
    .default(0)
    .optional(),
})

module.exports = {productSchema};