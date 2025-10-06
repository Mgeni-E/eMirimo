# eMirimo

> Empowering Rwandan youth and graduates with global remote opportunities and expert mentorship.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

## Overview

eMirimo is a Progressive Web Application (PWA) that bridges the gap between Rwandan students and graduates with verified remote job opportunities and mentorship programs. The platform provides a comprehensive ecosystem for career development and professional growth.

### eMirimo UI: [Click Here](https://www.figma.com/design/rph1I9Ehqao8N7bNADo3eN/Untitled?node-id=0-1&t=ADA0dV2B3HpLShOZ-1)

## Key Features

- **🔐 Secure Authentication** - JWT-based auth with role-based access control
- **💼 Job Marketplace** - Browse and apply for verified remote positions
- **👥 Mentorship Network** - Connect with industry experts and mentors
- **📱 Progressive Web App** - Works seamlessly across all devices
- **🌍 Multilingual** - English and Kinyarwanda language support
- **📊 Dashboard Analytics** - Track applications and career progress

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Zustand** for state management
- **React i18next** for internationalization

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Bcryptjs** for password hashing

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/eMirimo.git
   cd eMirimo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Environment Configuration

### Backend (.env)
```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emirimo
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## User Roles

- **👨‍🎓 Job Seeker** - Browse jobs, apply for positions, track applications
- **🏢 Employer** - Post jobs, manage applications, conduct interviews
- **🎯 Mentor** - Share expertise, guide mentees, host sessions
- **⚙️ Admin** - System management, user moderation, analytics

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User authentication | ❌ |
| GET | `/api/jobs` | List available jobs | ❌ |
| POST | `/api/jobs` | Create new job posting | ✅ (Employer) |
| GET | `/api/applications/me` | Get user applications | ✅ |
| POST | `/api/applications` | Submit job application | ✅ (Seeker) |
| GET | `/api/mentors` | List available mentors | ❌ |
| PUT | `/api/mentors/me` | Update mentor profile | ✅ (Mentor) |

## Development

### Available Scripts

**Backend**
```bash
npm run dev      # Development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

**Frontend**
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure
```
eMirimo/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── services/        # Business logic
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature-based modules
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utilities and API
│   │   └── i18n/            # Internationalization
│   └── package.json
└── README.md
```

## Security

- ✅ Environment variables for sensitive data
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Rate limiting (recommended for production)

## Deployment

### Backend (Recommended: Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend (Recommended: Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy automatically on push

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

## Support

For support and questions:
- 📧 Email: support@emirimo.com
- 💬 Discord: [Join our community](https://discord.gg/emirimo)
- 📖 Documentation: [docs.emirimo.com](https://docs.emirimo.com)

---

**Built with ❤️ for the Rwandan tech community**
