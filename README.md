# CV Project - Full Stack Application

A modern, professional CV/Resume web application built with Angular 20 frontend and Node.js/GraphQL backend.

## Project Structure

```
cv-angular/
├── src/                    # Angular frontend source
├── server/                 # Node.js/GraphQL backend
├── public/                 # Static assets
├── dist/                   # Build output
├── DEPLOYMENT.md          # Production deployment guide
└── vercel.json            # Vercel deployment config
```

## Frontend (Angular)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

### Development server

To start the frontend development server:

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Building the frontend

```bash
ng build
```

## Backend (Node.js/GraphQL)

The backend provides GraphQL API for CV data management with authentication.

### Setup backend

```bash
cd server
npm install
cp .env.example .env
# Configure your environment variables in .env
```

### Development server

```bash
cd server
npm run dev
```

The GraphQL server will be available at `http://localhost:4000/graphql`

### Building the backend

```bash
cd server
npm run build
```

## Features

- **Responsive Design**: Mobile-first, print-friendly CV layout
- **Admin Panel**: Authentication-protected content management
- **GraphQL API**: Modern, efficient data fetching
- **Form Management**: Dynamic forms for CV sections
- **PDF Export**: Generate PDF versions of the CV
- **Real-time Updates**: Live preview of changes

## Technology Stack

### Frontend
- Angular 20.1.5
- TypeScript
- Tailwind CSS
- Apollo GraphQL Client
- Angular Signals

### Backend
- Node.js
- GraphQL with Apollo Server
- MongoDB
- JWT Authentication
- TypeScript

## Running Tests

### Frontend tests
```bash
ng test
```

### End-to-end tests
```bash
ng e2e
```

## 🚀 Production Deployment

**⚠️ Critical Security Note**: 
- **NEVER** commit `.env` files to Git!
- **ALWAYS** use strong, unique passwords in production
- **CHANGE** default admin credentials (`admin/admin123`)

For comprehensive production deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy Options:

1. **Vercel (Recommended - Zero Config)**:
   ```bash
   npm run deploy:vercel
   ```

2. **Railway**:
   - Connect GitHub repo
   - Set environment variables
   - Auto-deploy on push

3. **DigitalOcean App Platform**:
   - Monorepo support
   - Managed databases
   - Automatic SSL

### Required Environment Variables for Production:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cv-app
JWT_SECRET=super-secure-random-string-production
ADMIN_USERNAME=your_secure_admin_username  
ADMIN_PASSWORD=Very$ecure9assw0rd2024!
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 🛡️ Security Checklist:
- ✅ Strong admin password set
- ✅ JWT secret changed from default
- ✅ MongoDB Atlas with restricted IP access
- ✅ HTTPS enabled (automatic with most platforms)
- ✅ Environment variables set on platform

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Development Workflow

1. **Frontend Development**: Use `ng serve` for live reload during development
2. **Backend Development**: Use `cd server && npm run dev` for GraphQL server
3. **Full Stack**: Run both servers simultaneously for complete development environment

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
