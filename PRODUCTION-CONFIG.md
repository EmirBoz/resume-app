# 🔒 PRODUCTION ENVIRONMENT VARIABLES

## 🚨 KRİTİK GÜVENLİK KURALLARI

### ❌ ASLA YAPMAYINIZ:
- 0.0.0.0/0 IP whitelist (Tüm dünyaya açık)
- admin/admin123 gibi basit şifreler
- .env dosyasını Git'e commit etmek
- HTTP kullanmak (sadece HTTPS)

### ✅ MUTLAKA YAPINIZ:
- Güçlü, benzersiz şifreler
- Platform-specific IP kısıtlaması
- Environment variables güvenli saklamak
- Regular backup'lar
- SSL/TLS encryption

## 📝 PRODUCTION ENVIRONMENT VARIABLES

### MongoDB Atlas Ayarları:
```bash
# Database Connection - GÜVENLİ IP KISITLAMASI İLE
MONGODB_URI=mongodb+srv://cv-prod-user:Cv$3cur3DbP@55w0rd2024!@cluster0.xxxxx.mongodb.net/cv-production-db

# Database Kullanıcısı:
Username: cv-prod-user
Password: Cv$3cur3DbP@55w0rd2024!
Roles: readWrite@cv-production-db

# IP Whitelist (Vercel için):
- 76.76.19.0/24
- 76.76.21.0/24
- 76.223.126.0/24
- 64.23.132.0/24
```

### Application Ayarları:
```bash
NODE_ENV=production
PORT=4000

# JWT Secret - 64+ karakter güçlü
JWT_SECRET=Kv9$mN2pL8xR5#qW7eT1uI3oP6sD9fG4hJ8kM2nB5vC7xZ1aS4dF6gH9jK3lQ8wE2rT5yU7iO0p
JWT_EXPIRES_IN=7d

# Admin Credentials - ÇOOK GÜÇLÜ!
ADMIN_USERNAME=cv_admin_prod_2024
ADMIN_PASSWORD=Cv$ecur3Admin2024!@#Pr0duct1onV3ryStr0ng

# CORS - Sadece kendi domain'iniz
CORS_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app
```

## 🚀 DEPLOYMENT ADIM ADIM

### 1. MongoDB Atlas Kurulumu (Production)

1. **Cluster Oluştur**:
   - M0 Free Tier seç
   - Region: En yakın lokasyon
   - Cluster Name: cv-production

2. **Database User**:
   ```
   Username: cv-prod-user
   Password: [Çok güçlü şifre - min 20 karakter]
   Database User Privileges: readWrite@cv-production-db
   ```

3. **Network Access - KRİTİK!**:
   ```
   ❌ DELETE: 0.0.0.0/0 (Varsa silin!)
   
   ✅ ADD ONLY THESE IPs:
   - 76.76.19.0/24    (Vercel)
   - 76.76.21.0/24    (Vercel)  
   - 76.223.126.0/24  (Vercel)
   - 64.23.132.0/24   (Vercel)
   ```

4. **Database & Collections**:
   ```
   Database Name: cv-production-db
   Collections: users, resumedata
   ```

### 2. Vercel Deployment

1. **Vercel CLI Kurulum**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Environment Variables** (Vercel Dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=[Atlas connection string]
   JWT_SECRET=[64+ karakter güçlü]
   ADMIN_USERNAME=[Güvenli username]
   ADMIN_PASSWORD=[Çok güçlü şifre]
   CORS_ORIGINS=https://your-app.vercel.app
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### 3. Post-Deployment Test

1. **Database Bağlantısı**:
   - GraphQL Playground: https://your-app.vercel.app/graphql
   - Test query çalıştır

2. **Admin Login**:
   - Frontend'de admin panel'e giriş yap
   - Yeni güçlü şifre ile test et

3. **Security Validation**:
   - HTTPS çalışıyor mu?
   - Sadece whitelist IP'lerden MongoDB erişimi var mı?
   - CORS sadece kendi domain'den çalışıyor mu?

## 🛡️ GÜVENLİK CHECKLİST

### Pre-Deployment:
- [ ] MongoDB Atlas IP sadece platform IP'leri
- [ ] Güçlü admin şifresi ayarlandı (20+ karakter)
- [ ] JWT secret 64+ karakter rastgele string
- [ ] CORS sadece production domain
- [ ] .env dosyası Git'te ignore
- [ ] Database backup aktif

### Post-Deployment:
- [ ] Admin login çalışıyor
- [ ] GraphQL endpoint erişilebilir  
- [ ] Database CRUD işlemleri çalışıyor
- [ ] SSL sertifikası aktif (https://)
- [ ] Monitoring kuruldu
- [ ] Error log'lar takip ediliyor

### Ongoing Security:
- [ ] Aylık şifre kontrolü
- [ ] Dependency güncellemeleri
- [ ] Security alert takibi
- [ ] Database backup test
- [ ] Performance monitoring

## 🚨 ACİL DURUM PROSEDÜRÜ

### Güvenlik Ihlali Şüphesi:
1. ⚡ MongoDB Atlas'tan TÜM IP'leri kaldır
2. ⚡ Database user şifrelerini değiştir
3. ⚡ JWT secret'i yenile (herkes logout olur)
4. ⚡ Log analizi yap
5. ⚡ Backup'tan restore yap

### Uygulama Sorunu:
1. Vercel Dashboard > Functions log kontrol
2. Environment variables doğru mu?
3. Database connection test et
4. Health check endpoint test (/health)

## 📊 MONİTORİNG & ALERTS

### Vercel Dashboard:
- Function errors
- Response times  
- Traffic patterns
- Build failures

### MongoDB Atlas:
- Connection count
- CPU/Memory usage
- Query performance
- Backup status

Bu konfigürasyonla uygulamanız %100 production-ready ve güvenli olacak!
