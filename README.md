# 🏛️ Ward Portal: Digitalizing Local Governance

Ward Portal is a comprehensive digital solution designed to streamline the interaction between citizens, ward officers, and municipal administrators. It focuses on transparency, efficiency, and accessibility in local government services.

---

## 🌟 Project Vision
The goal of this project is to create a transparent ecosystem where citizens' concerns are addressed promptly, public assets are managed effectively, and administrative tasks are digitized for better accountability.

---

## 📸 Project Showcase

![Home Banner](Frontend/src/Image/Home.png)
*Modern and Intuitive Citizen Dashboard*

![Contact & Support](Frontend/src/Image/contact.png)
*Dedicated Support and Communication Channels*

---

## 🏛️ Governance & Leadership

The portal provides a platform for ward leaders to connect with their constituents:

- **Chairperson Profiles**: Detailed bios, educational backgrounds, and political transparency.
- **Direct Accountability**: Personal and office contact details verified by the municipal admin.
- **Biographical Narratives**: Leaders can share their vision and past experiences directly on their public profile.

---

## 📦 Resource & Asset Governance

Efficient management of public and personal assets:

- **Ward Asset Tracking**: Monitoring of municipal resources, infrastructure, and budget allocations.
- **Chairperson Personal Assets**: A transparency feature allowing leaders to declare assets as part of public accountability.
- **Geospatial Integration**: Office locations linked with Google Maps for easy citizen access.

---

## 🛠️ Technical Architecture

### 📁 Workspace Organization

```text
.
├── Backend/                 # RESTful PHP API Layer
│   ├── api/                 # Endpoint logic (auth, communication, wards, etc.)
│   └── uploads/             # Centralized file storage for documents & photos
└── Frontend/                # Modern React Application
    ├── src/
    │   ├── Context/         # Global State Management (Auth, Ward, Language)
    │   ├── Pages/           # Feature-specific page components
    │   ├── Component/       # Reusable UI primitives
    │   └── data/            # Static assets and translations
```

### 📡 Backend API Infrastructure

The backend is organized into modular services to ensure scalability and maintainability:

| Service | Responsibility | Key Endpoints |
| :--- | :--- | :--- |
| **Auth** | Secure login, registration & recovery | `/auth/login`, `/auth/register` |
| **Communication** | Complaints, reviews, and feedback | `/communication/complaint/send_complaint` |
| **Governance** | Ward and officer management | `/admin/approve_officer`, `/wards/manage_wards` |
| **Assets** | Infrastructure and budget tracking | `/assets/manage_ward_assets` |
| **Notifications** | Real-time user alert system | `/notifications/get_notifications` |

---

## 🏗️ Core Workflow: Complaint Resolution

The Ward Portal implements a closed-loop feedback system:

1. **Initiation**: Citizen submits a complaint with description and optional media.
2. **Assignment**: System routes the complaint to the relevant Ward Officer.
3. **Engagement**: Officer reviews and updates status (Open → Processing → Resolved).
4. **Validation**: Citizen receives notification and can provide a review on the resolution.

---

## ✨ Premium UI/UX Features

- **Responsive Grid System**: Optimized for mobile devices (Citizen use case) and high-density dashboards (Officer/Admin use case).
- **Glassmorphism & Micro-animations**: Subtle transitions and transparent UI elements for a modern "Apple-like" aesthetic.
- **Robust Field Validation**: Real-time error handling with `react-toastify` integration.
- **Bilingual Core**: Dynamic translation engine that supports complex nested keys for high-quality Nepali localization.

---

## 📊 Future Roadmap

- [ ] **Mobile App**: Native Android/iOS applications for field officers.
- [ ] **SMS Integration**: Automatic SMS alerts for citizens in low-internet areas.
- [ ] **GIS Mapping**: Visualizing complaint hotspots on a ward map for better planning.

---

## 💻 Tech Stack Detail

### Frontend

- **React 18**: Utilizing functional components and custom hooks for efficient rendering.
- **Fast Refresh**: Optimized file structure to ensure ultra-fast development cycles.
- **Vanilla CSS3**: Leveraging custom properties (variables) for a consistent design system.

### Backend

- **RESTful PHP**: Stateless architecture for clean frontend-backend coupling.
- **MySQL PDO**: Secure database interactions using prepared statements to prevent SQL injection.
- **Email System**: Integrated SMTP support for password resets and official communications.

---

## 🛠️ Detailed Setup Instructions

### Backend Database Configuration

- Ensure your local MySQL server is running.
- Use a tool like `phpMyAdmin` to import the `.sql` dump.
- Update `Backend/api/db_connect.php`:

```php
$hostname = "localhost";
$username = "root";
$password = ""; // Or your password
$dbname = "ward_portal_db";
```

### Running the Frontend

```bash
# Install NPM packages
npm install

# Build for development (Vite)
npm run dev
```

---

## 📝 License & Attribution

This project is open for collaboration and municipal enhancement.
**Maintainer**: [Ruksan karki]

---

*“Digital Transformation for a Better Tomorrow.”*
