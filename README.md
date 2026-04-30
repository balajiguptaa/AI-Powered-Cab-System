# CorpCab – AI-Based Corporate Cab Allocation System

## Tech Stack
- **Backend**: Spring Boot 3.2, Java 17, JPA/Hibernate
- **Frontend**: React 18, Tailwind CSS, Leaflet, Recharts
- **Database**: MySQL 8
- **AI Logic**: K-Means Clustering + Nearest Neighbor (Java, inside backend)

---

## Project Structure
```
cab-system/
├── backend/          # Spring Boot project
│   └── src/main/java/com/cabsystem/
│       ├── controller/   # REST endpoints
│       ├── service/      # Business logic + AI
│       ├── repository/   # JPA repositories
│       ├── model/        # JPA entities
│       └── config/       # CORS, DataSeeder
├── frontend/         # React app
│   └── src/
│       ├── pages/admin/     # Admin module
│       ├── pages/employee/  # Employee module
│       ├── components/      # Shared UI components
│       └── services/api.js  # Axios API calls
└── database/
    └── schema.sql    # DB creation reference
```

---

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8+

---

## Step 1: Database Setup

```sql
-- In MySQL client or workbench:
CREATE DATABASE IF NOT EXISTS cab_system;
```

Update `backend/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cab_system?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root   # ← change to your MySQL password
```

---

## Step 2: Run Backend

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

On first startup, `DataSeeder.java` auto-inserts:
- Admin user: `admin / admin123`
- 5 employee accounts: `emp1–emp5 / pass123`
- 4 cabs (SEDAN, SUV, MINIVAN)

---

## Step 3: Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

---

## Usage Flow

### Admin
1. Login as `admin / admin123`
2. Go to **Manage Employees** → verify employees exist
3. Go to **Manage Cabs** → verify cabs exist
4. Go to **Requests** → wait for employee requests
5. Go to **Optimization** → click **Run Optimization**
6. Go to **Routes Map** → view clustered routes on map
7. Go to **Analytics** → view demand + distance charts

### Employee
1. Login as `emp1 / pass123`
2. Go to **Request Cab** → click map to pin location → choose time → submit
3. After admin runs optimization → check **My Rides** for assigned cab + route map
4. Check **Notifications** for status updates

---

## REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/employees | List all employees |
| POST | /api/employees | Create employee |
| GET | /api/cabs | List all cabs |
| POST | /api/cabs | Create cab |
| GET | /api/requests | All requests |
| POST | /api/requests | Submit request |
| POST | /api/optimize/run | **Run AI optimization** |
| GET | /api/optimize/demand | Demand prediction data |
| GET | /api/routes | All routes |
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/notifications/user/{id} | User notifications |

---

## AI Logic (Java)

Located in `OptimizationService.java`:

1. **K-Means Clustering** — Groups employee pickup points geographically (k ≈ ceil(n/4))
2. **Nearest Neighbor Routing** — Sorts pickups per cluster to minimize travel distance
3. **Cab Allocation** — Assigns smallest-capacity cab that fits the cluster size
4. **Demand Prediction** — Groups historical requests by hour slot for trend analysis
