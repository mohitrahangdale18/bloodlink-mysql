# 🩸 BloodLink - Community Blood Donor Network

BloodLink is a full-stack platform connecting voluntary blood donors with recipients in urgent need. This project has been upgraded with **Location-Based Donor Search**, allowing recipients to discover nearby compatible donors within 5 km, 10 km, or 25 km using MySQL Haversine distance calculations.

---

## 🚀 Key Features

- **Location-Based Donor Search**: Find compatible blood donors within a specified radius (5 km, 10 km, 25 km, or 50 km) sorted nearest-first.
- **Smart Blood Compatibility Engine**: Uses medical compatibility rules (e.g. O- universal donor, AB+ universal recipient) to match eligible donors.
- **Browser Geolocation & Manual Fallback**: Acquire donor and recipient coordinates via browser GPS with user permission, or input coordinates manually if permission is denied.
- **Privacy First**: Exact coordinates (`latitude`, `longitude`) are strictly excluded from public search results. Only approximate distance (e.g. `~2.4 km away`) is displayed.
- **Classic City Search Fallback**: Seamless toggle to search donors by city name without GPS.
- **Donor Profile Management**: Donors can update their blood group, donation availability, city, and GPS location.
- **Blood Request Workflow**: Post urgent blood requests with hospital details, urgency level, and contact info.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express 4, Sequelize ORM 6, JSON Web Tokens (JWT), bcryptjs
- **Database**: MySQL 8.0 (Supports local instances and cloud instances such as Aiven with SSL)
- **Distance Formula**: Haversine formula computed directly within MySQL queries for high performance and reduced Node.js memory overhead.

---

## 🌐 API Documentation

All donor routes require a JWT bearer token in the `Authorization` header (`Bearer <token>`).

### 1. Search Donors (Nearby / Radius & City)
- **Endpoint**: `GET /api/donors/search`
- **Query Parameters**:
  - `bloodGroup` *(required)*: Recipient blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
  - `latitude` *(optional)*: Latitude (-90 to 90). Required if `longitude` is provided.
  - `longitude` *(optional)*: Longitude (-180 to 180). Required if `latitude` is provided.
  - `radius` *(optional, default: 10)*: Distance radius in kilometers (e.g. `5`, `10`, `25`, `50`).
  - `city` *(optional)*: Filter by city name substring.
- **Example Request**:
  ```http
  GET /api/donors/search?bloodGroup=O+&latitude=21.1458&longitude=79.0882&radius=10
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "radiusKm": 10,
    "data": [
      {
        "id": "7f093be8-8e6d-47be-a5e3-4d7a1e04130f",
        "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "bloodGroup": "O+",
        "city": "Nagpur",
        "isAvailable": true,
        "totalDonations": 4,
        "distanceKm": 1.8,
        "user": {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "name": "Aarav Sharma",
          "email": "aarav@example.com",
          "phone": "+91 9876543210",
          "city": "Nagpur",
          "bloodGroup": "O+"
        }
      }
    ]
  }
  ```
  *(Note: Exact `latitude` and `longitude` are omitted for privacy.)*

### 2. Get Donor Profile
- **Endpoint**: `GET /api/donors/profile`
- **Response**: Returns the logged-in user's donor profile, including their saved `latitude` and `longitude`.

### 3. Create or Update Donor Profile
- **Endpoint**: `POST /api/donors/profile` (Create) / `PUT /api/donors/profile` (Update)
- **Request Body**:
  ```json
  {
    "bloodGroup": "O+",
    "city": "Nagpur",
    "isAvailable": true,
    "lastDonated": "2026-08-15",
    "latitude": 21.1458,
    "longitude": 79.0882
  }
  ```

### 4. Toggle Availability
- **Endpoint**: `PATCH /api/donors/availability`

---

## 🗄️ Database Migrations

The `latitude` and `longitude` columns can be added using any of the following safe methods:

1. **Automatic Synchronization (Default)**:
   The backend runs `sequelize.sync({ alter: true })` on server start, which automatically adds `latitude` (`DECIMAL(10, 8)`) and `longitude` (`DECIMAL(11, 8)`) without data loss.

2. **Sequelize Migration Script**:
   Located at `server/migrations/20261021_add_location_to_donors.js`.

3. **Raw SQL Migration Script**:
   Located at `server/migrations/add_location_to_donors.sql`:
   ```sql
   ALTER TABLE `Donors` 
   ADD COLUMN IF NOT EXISTS `latitude` DECIMAL(10, 8) NULL DEFAULT NULL,
   ADD COLUMN IF NOT EXISTS `longitude` DECIMAL(11, 8) NULL DEFAULT NULL;
   CREATE INDEX `idx_donors_location` ON `Donors` (`latitude`, `longitude`);
   ```

Existing donor records without coordinates continue to operate normally with `latitude: null, longitude: null`.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bloodlink
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_SSL=false
JWT_SECRET=bloodlink_jwt_secret_key_2026
```
*(Set `DB_SSL=true` if using a cloud MySQL instance such as Aiven).*

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🧪 Testing Locally

### 1. Run Automated Backend Tests
From the `server` directory:
```bash
cd server
npm test
```
Runs 24 automated tests covering:
- Haversine distance calculations and symmetry
- Radius threshold filtering (5 km, 10 km, 25 km)
- Blood group compatibility logic
- Input validation (missing coordinates, out-of-range bounds, invalid radius, invalid blood group)
- Privacy verification (coordinate removal in responses)

### 2. Run Frontend Lint and Build
From the `client` directory:
```bash
cd client
npm run lint
npm run build
```

### 3. Start Development Servers
- **Backend**:
  ```bash
  cd server
  npm run dev
  ```
- **Frontend**:
  ```bash
  cd client
  npm run dev
  ```
