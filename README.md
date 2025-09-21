Supermarket App (with JWT auth)
================================

Structure:
- backend/ : Express API with JWT authentication (file-based db.json)
- frontend/: Vite + React app using Tailwind CDN

Backend notes:
- Default admin is created on first run: username `admin`, password `admin`. Change it.
- Auth endpoints:
  - POST /api/auth/register { username, password, role }  -> create user
  - POST /api/auth/login { username, password } -> get { token, user }
- Protected endpoints require Authorization: Bearer <token>
  - POST /api/products, PUT /api/products/:id, DELETE /api/products/:id
  - POST /api/sales, GET /api/sales

Run:
- backend:
  cd backend
  npm install
  npm run dev
- frontend:
  cd frontend
  npm install
  npm run dev

