# Full-Stack Marketplace MVP

A fully functional Minimum Viable Product (MVP) of an e-commerce platform featuring a dedicated backend, PostgreSQL database integration, and a modern React frontend.

## 🚀 Overview

This project demonstrates a complete e-commerce workflow, from product browsing to user authentication and order management. It is built with a focus on clean architecture, type safety, and scalable styling.

## 🛠 Tech Stack

### Frontend
*   **React 18** with **TypeScript**
*   **Vite** for fast development and bundling
*   **SCSS** (BEM methodology and modular structure)
*   **Context API** for global state management (Auth, Basket)
*   **React Router Dom** for navigation

### Backend
*   **Node.js & Express**
*   **PostgreSQL** (Relational Database)
*   **JWT (JSON Web Tokens)** for secure authentication
*   **Zod** for schema validation
*   **Bcrypt** for password hashing

## ✨ Key Features

- **Product Catalog:** Dynamic loading of products from the database.
- **Advanced UI:** Detailed product views within modal windows.
- **User System:** Secure registration and login with role-based access.
- **Shopping Cart:** Persistent basket logic using React Context.
- **Reviews & Ratings:** Ability for users to leave feedback on products.
- **Management:** Backend controllers for handling users, products, orders, and reviews.

## 📂 Project Structure
├── backend/            # Express server, DB config, and controllers
│   ├── controller/     # Business logic for each entity
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and validation guards
│   └── schemas/        # Zod validation schemas
└── frontend/           # React application
    └── firstAPI/       # Main Vite + React project
        ├── src/api/    # Axios/Fetch configurations
        ├── src/context/# Global state providers
        └── src/assets/ # SCSS modules and images
        
⚙️ Installation & Setup
Prerequisites
Node.js (v16 or higher)
PostgreSQL

1. Clone the Repository
git clone [https://github.com/ALeksandrCherkas/Online-Store.git](https://github.com/ALeksandrCherkas/Online-Store.git)
cd Online-Store
2. Backend Setup
Navigate to the backend folder:
cd backend

Install dependencies:
npm install

Environment Variables:
Create a .env file in the backend directory:

PORT=5000
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
JWT_SECRET=your_secret_key
Initialize Database:
Use the provided database.sql file to set up your PostgreSQL tables.

Start the server:
npm run dev

3. Frontend Setup
Open a new terminal and navigate to the frontend:
cd frontend/firstAPI

Install dependencies:
npm install

Launch the development server:
npm run dev

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👤 Author
Aleksandr Cherkas

GitHub: @ALeksandrCherkas
