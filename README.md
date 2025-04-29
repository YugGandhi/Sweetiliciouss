Sweetiliciouss

Sweetiliciouss is an online platform designed for selling sweets, desserts, and bakery items. It offers a user-friendly experience for browsing products, placing orders, and managing sweet shop operations through an intuitive dashboard.

🚀 Features

🎂 Browse a wide variety of sweets and desserts
🛒 Add items to cart and checkout
👤 User authentication (signup/login)
📦 Order management
📊 Admin dashboard for managing products, orders, and users
🔎 Search and filter products
🖼️ Upload and manage product images
⚡ Responsive design for mobile and desktop devices
🛠 Tech Stack

Frontend:

React.js
Redux (state management)
React Router (routing)
Axios (API calls)
Bootstrap / TailwindCSS (UI styling)
Backend:

Node.js
Express.js
MongoDB (Database)
Mongoose (ODM for MongoDB)
JSON Web Tokens (Authentication)
Multer (File uploads)
Other Tools:

dotenv (Environment variables)
Bcrypt.js (Password hashing)
CORS (Cross-Origin Resource Sharing)
GitHub (Version control)



Sweetiliciouss/
│
├── backend/               # Express.js backend
│   ├── config/             # Database config and other configs
│   ├── controllers/        # Controller logic for routes
│   ├── models/             # Mongoose models (User, Product, Order, etc.)
│   ├── routes/             # Express routes
│   ├── middleware/         # Auth and error middleware
│   └── server.js           # Entry point for backend
│
├── user_module/            # Possibly user-specific modules (optional)
│
├── public/                 # Static files
│
├── src/                    # React Frontend
│   ├── assets/             # Images, logos, etc.
│   ├── components/         # Reusable components
│   ├── pages/              # Full-page components (Home, ProductPage, etc.)
│   ├── services/           # API services
│   ├── store/              # Redux store setup
│   ├── App.js              # App structure and routing
│   └── index.js            # React entry point
│
├── .env                    # Environment variables
├── package.json            # NPM dependencies and scripts (Frontend)
├── package-lock.json       
└── README.md               # Project documentation
