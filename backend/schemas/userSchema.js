const { z} = require('zod');
const registrationSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    name: z.string().min(3, "Name must be at least 3 characters long"),
    role: z.enum(["admin", "user"]).optional().default("user"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});


module.exports = {registrationSchema, loginSchema};