# eMirimo - Job Platform for Rwandan Youth

eMirimo is a comprehensive job management platform that connects Rwandan youth and graduates with employment opportunities, helping to fight unemployment in Rwanda and planning to scale to East Africa.

## 🔗 Links
- **GitHub Repository**: https://github.com/Mgeni-E/eMirimo.git
- **UI Design**: [Figma Design](https://www.figma.com/design/rph1I9Ehqao8N7bNADo3eN/Untitled?node-id=0-1&t=ADA0dV2B3HpLShOZ-1)
- **Video Presentation**: [https://youtu.be/eMk8w8huluQ?si=yHQXlOFN2gGik8ql](https://youtu.be/P0iTgj884CI)

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Job Management**: Full CRUD operations for job postings with AI matching
- **Real-time Notifications**: Socket.io powered notifications
- **Admin Panel**: Comprehensive analytics and user management
- **Multilingual Support**: English and Kinyarwanda
- **Progressive Web App**: Works seamlessly across all devices

### Key Features
- **🔐 Secure Authentication** - JWT-based auth with role-based access control
- **💼 Job Marketplace** - Browse and apply for verified remote positions
- **👥 Mentorship Network** - Connect with industry experts and mentors
- **📱 Progressive Web App** - Works seamlessly across all devices
- **🌍 Multilingual** - English and Kinyarwanda language support
- **📊 Dashboard Analytics** - Track applications and career progress
- **🤖 AI-Powered Matching** - Smart job recommendations based on skills and preferences

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Socket.io Client** for real-time features
- **React i18next** for internationalization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Bcrypt** for password hashing
- **Helmet** for security headers

### DevOps
- **GitHub Actions** for CI/CD
- **Jest & Vitest** for testing
- **ESLint & Prettier** for code quality

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis (optional, for caching)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mgeni-E/eMirimo.git
   cd eMirimo
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Quick Start

eMirimo is configured for deployment to:
- **Frontend**: Vercel (automatic deployment via GitHub Actions)
- **Backend**: Render with Node.js environment (manual dashboard setup)
- **Database**: MongoDB Atlas

**Note**: 
- Backend uses Node.js runtime on Render
- Manual deployment via Render dashboard (no YAML files needed)

### Automated Deployment

The project includes GitHub Actions workflows for automatic deployment:

1. **Frontend** (`.github/workflows/deploy-frontend.yml`)
   - Automatically deploys to Vercel on push to `main`/`master`
   - Triggers on changes to `frontend/**` directory

2. **Backend** (`.github/workflows/deploy-backend.yml`)
   - Builds and validates backend on push to `main`/`master`
   - Render auto-deploys from GitHub integration
   - Triggers on changes to `backend/**` directory

#### Quick Setup Steps:

1. **MongoDB Atlas**
   - Create cluster and get connection string
   - Configure database user and IP whitelist

2. **Render (Backend) - Manual Setup**
   - Create new Web Service
   - **Important**: Select "Node" environment
   - Connect GitHub repository
   - **Settings → Build & Deploy:**
     - **Root Directory**: `backend`
     - **Build Command**: `npm install` (build runs automatically)
     - **Start Command**: `npm start`
     - **Node Version**: `20` (or leave blank to use .nvmrc)
   - **Settings → Health Check:**
     - **Health Check Path**: `/health`
   - **Environment tab**: Add all environment variables
   - Enable Auto-Deploy

3. **Vercel (Frontend)**
   - Import GitHub repository
   - Set root directory to `frontend`
   - Configure environment variables
   - Get Organization ID, Project ID, and Token

4. **GitHub Secrets** (for frontend deployment)
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VERCEL_PROJECT_ID` - Vercel project ID
   - `VITE_API_URL` - Backend API URL (optional)

### Environment Variables

#### Backend (Render)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emirimo
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES=7d
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Firebase (Required for document uploads - CV/Resume)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket-name.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=base64-encoded-service-account-json
# OR use individual credentials:
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Cloudinary (Optional - for profile pictures only)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_IMAGE_PRESET=your-image-preset
```

#### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=eMirimo
VITE_APP_VERSION=1.0.0
```

### Manual Deployment

#### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

## 📁 Project Structure

```
emirimo/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── __tests__/      # Backend tests
│   ├── package.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature-specific components
│   │   ├── lib/           # Utilities and services
│   │   ├── contexts/      # React contexts
│   │   └── __tests__/     # Frontend tests
│   ├── package.json
│   └── vitest.config.ts
├── .github/
│   └── workflows/         # CI/CD pipelines
└── README.md
```

## 🔧 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job (employers only)
- `GET /api/jobs/recommendations` - Get job recommendations
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Learning
- `GET /api/learning/resources` - Get learning content
- `GET /api/learning/recommendations` - Get personalized learning recommendations
- `POST /api/learning/resources` - Add content (admins only)

### Privacy
- `GET /api/privacy/my-data` - Download user data
- `POST /api/privacy/delete-account` - Delete account
- `PUT /api/privacy/consent` - Update consent preferences

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** on API endpoints
- **CORS Protection** with configurable origins
- **Helmet Security Headers**
- **Input Validation** and sanitization
- **SQL Injection Protection** (NoSQL injection)
- **XSS Protection** with Content Security Policy
- **HTTPS Enforcement** in production

## 🌍 Internationalization

The platform supports multiple languages:
- **English** (default)
- **Kinyarwanda** (Ikinyarwanda)

Language detection is automatic based on browser settings, with manual switching available.

## ♿ Accessibility

- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation** support
- **Screen Reader** compatibility
- **High Contrast** mode
- **Focus Indicators** for all interactive elements
- **Alt Text** for all images

## 📊 Analytics & Monitoring

- **Request Logging** with structured data
- **Error Tracking** and alerting
- **Performance Metrics** collection
- **User Analytics** (with consent)
- **Admin Dashboard** with real-time metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow the commit message convention

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rwandan Tech Community** for inspiration and feedback
- **Open Source Contributors** for the amazing tools we use
- **Mentors and Advisors** for guidance and support

## 📞 Support

For support and questions:
- **Email**: support@emirimo.com
- **GitHub Issues**: [Create an issue](https://github.com/Mgeni-E/eMirimo/issues)
- **Documentation**: [Wiki](https://github.com/Mgeni-E/eMirimo/wiki)

## 🗺 Roadmap

### Phase 1 (Completed)
- ✅ Core authentication and user management
- ✅ Job posting and application system
- ✅ Learning hub with content management
- ✅ Admin panel with analytics
- ✅ PWA features and offline support
- ✅ Real-time notifications
- ✅ AI-powered job matching

### Phase 2 (In Progress)
- 🔄 Advanced AI matching algorithms
- 🔄 Video interview scheduling
- 🔄 Skills assessment and certification
- 🔄 Mobile app (React Native)
- 🔄 Payment integration for premium features

### Phase 3 (Future)
- 🔄 Blockchain-based credential verification
- 🔄 Advanced analytics and insights
- 🔄 Integration with external job boards
- 🔄 Multi-tenant architecture for organizations

---

**Built with ❤️ for the Rwandan tech community**
