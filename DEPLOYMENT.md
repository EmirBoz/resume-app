# 🚀 Production Deployment Guide

## 📋 Ön Hazırlıklar

### 1. MongoDB Atlas Kurulumu

1. **MongoDB Atlas Hesabı Oluşturun**
   - [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı açın
   - Ücretsiz M0 cluster oluşturun

2. **Database Kullanıcısı Oluşturun**
   ```
   Username: cv-app-user
   Password: [Güçlü bir şifre oluşturun]
   Roles: Atlas admin veya readWriteAnyDatabase
   ```

3. **Network Access Ayarları**
   - IP Whitelist'e `0.0.0.0/0` ekleyin (tüm IP'ler için geçici)
   - Production'da specific IP'ler ekleyeceksiniz

4. **Connection String Alın**
   ```
   mongodb+srv://cv-app-user:PASSWORD@cluster0.xxxxx.mongodb.net/cv-app?retryWrites=true&w=majority
   ```

### 2. Environment Variables Production Değerleri

Production için aşağıdaki environment variable'ları ayarlayın:

```bash
# Production Environment Variables
NODE_ENV=production
PORT=4000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://cv-app-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cv-app?retryWrites=true&w=majority

# JWT Secret (Güçlü, rastgele bir string)
JWT_SECRET=super-secret-jwt-key-production-2024-randomly-generated-string
JWT_EXPIRES_IN=7d

# Admin Credentials (Güçlü şifreler)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=Very$ecure9assw0rd2024!

# CORS Origins (Production domain'leriniz)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🌐 Deployment Seçenekleri

### Option 1: Vercel (Önerilen - Kolay)

1. **Frontend + Backend Birlikte Deploy**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables Ayarlama**
   - Vercel Dashboard > Settings > Environment Variables
   - Yukarıdaki production değerlerini ekleyin

3. **vercel.json Dosyası**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/src/server.ts",
         "use": "@vercel/node"
       },
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/cv-angular/browser"
         }
       }
     ],
     "routes": [
       {
         "src": "/graphql",
         "dest": "/server/src/server.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/cv-angular/browser/index.html"
       }
     ]
   }
   ```

### Option 2: Railway (Backend + Frontend)

1. **Railway Hesabı**
   - [Railway](https://railway.app) hesabı açın
   - GitHub repository'nizi bağlayın

2. **Backend Service**
   - New Service > GitHub Repo
   - Root directory: `/server`
   - Environment variables ekleyin

3. **Frontend Service**
   - Angular build için ayrı service
   - Static file hosting

### Option 3: DigitalOcean App Platform

1. **App Platform'da Yeni App**
   - GitHub repository bağlayın
   - Monorepo yapılandırması

2. **Backend Component**
   ```yaml
   name: cv-backend
   source_dir: /server
   github:
     repo: your-username/cv-angular
     branch: main
   run_command: npm start
   environment_slug: node-js
   instance_count: 1
   instance_size_slug: basic-xxs
   envs:
     - key: NODE_ENV
       value: production
     # Diğer env vars...
   ```

3. **Frontend Component**
   ```yaml
   name: cv-frontend
   source_dir: /
   github:
     repo: your-username/cv-angular
     branch: main
   build_command: npm run build:prod
   output_dir: /dist/cv-angular/browser
   environment_slug: node-js
   instance_count: 1
   instance_size_slug: basic-xxs
   ```

## 🔧 Build Scripts Güncellemesi

Package.json'a production build scriptleri ekleyin:

```json
{
  "scripts": {
    "build:prod": "ng build --configuration production",
    "build:server": "cd server && npm run build",
    "start:prod": "cd server && npm start",
    "deploy:vercel": "vercel --prod",
    "postinstall": "cd server && npm install"
  }
}
```

## 🛡️ Güvenlik Checklist

- ✅ `.env` dosyası Git'te ignore ediliyor
- ✅ Production'da güçlü şifreler kullanılıyor
- ✅ JWT secret production'da değiştirildi
- ✅ MongoDB Atlas kullanılıyor
- ✅ CORS origins production domain'lere ayarlandı
- ✅ Environment validation mevcut
- ✅ HTTPS kullanılıyor

## 📝 Deployment Sonrası

1. **Domain Ayarları**
   - DNS kayıtlarını güncelleyin
   - SSL sertifikası otomatik aktif olacak

2. **Database Migration**
   - İlk admin kullanıcısı otomatik oluşturulacak
   - Test verilerini MongoDB Atlas'a aktarın

3. **Monitoring**
   - Platform'un monitoring araçlarını kullanın
   - Log'ları takip edin

## 🚨 Önemli Notlar

- **Asla** production şifrelerini kod'da hardcode etmeyin
- Environment variables'ı platform dashboard'larından ayarlayın
- Regular backup'lar alın
- Security güncellemelerini takip edin