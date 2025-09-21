🛒 Stockly

A full-stack Supermarket Management App with inventory tracking, sales management, and secure authentication.

✨ Features
```
🏷️ Product Management – Add, edit, delete products

💰 Sales Management – Track and record sales

📊 Statistics Dashboard – Total products, stock value, and daily earnings

🔐 JWT Authentication – Secure protected endpoints

💾 Persistent Storage – JSON file-based database

🌐 Public & Protected APIs – Flexible access control
```
🚀 Live Demo

Check out Stockly live on Vercel:
🌐 Stockly Live

🔑 Default Credentials

Admin Login:
```
username: admin

password: admin

Sales Password: 1234
```
📡 API Endpoints
🔓 Public
```
GET /api/products → Fetch all products

GET /api/sales → Fetch all sales

GET /api/stats → Sales statistics
```
🔐 Protected (JWT Required)
```
POST /api/products → Add product

PUT /api/products/:id → Update product

DELETE /api/products/:id → Delete product

POST /api/sales → Record a sale
```
🛠️ Installation & Setup
1️⃣ Clone Repository
```
git clone https://github.com/your-username/stockly.git
```
```
cd stockly/backend
```
2️⃣ Install Dependencies
```
npm install
```
3️⃣ Start Backend
```
npm run dev
```

Backend runs on 👉 ```http://localhost:5000```

✅ Frontend Setup
```
cd frontend
npm install
npm run dev

```
Open the Vite URL (usually http://localhost:5173)

🎨 Screenshots

(Add screenshots of Stockly UI here to make it visually appealing)

🤝 Contributing

Contributions are welcome! 🎉 Fork the repo and submit PRs.

⭐ Support

If you like Stockly, star 🌟 the repo and share it with others!
