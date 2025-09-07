# CV Angular App - Deployment Guide

## Quick Deployment

### 1. Build for Production
```bash
npm run build:prod
```

### 2. Deploy to Static Hosting

#### Vercel (Önerilen)
1. GitHub'a push yap
2. Vercel'e import et
3. Build Command: `npm run build:prod`
4. Output Directory: `dist/cv-angular/browser`

#### Netlify
1. GitHub'a push yap
2. Netlify'a import et
3. Build Command: `npm run build:prod`
4. Publish Directory: `dist/cv-angular/browser`

#### GitHub Pages
```bash
npm install -g angular-cli-ghpages
ng build --configuration production --base-href "/repository-name/"
npx angular-cli-ghpages --dir=dist/cv-angular/browser
```

## CV Güncelleme

### Statik Veri Güncelleme
1. `src/app/data/resume-data.ts` dosyasını düzenle
2. Yeni build al: `npm run build:prod`
3. Deploy et

### Örnek Güncelleme
```typescript
// src/app/data/resume-data.ts
export const RESUME_DATA: ResumeData = {
  name: 'Yeni İsim',
  work: [
    {
      company: 'Yeni Şirket',
      title: 'Yeni Pozisyon',
      start: '2024/01',
      end: null,
      description: 'Yeni iş açıklaması...'
    },
    // Mevcut işler...
  ]
}
```

## Performance Monitoring

### Bundle Size Analizi
```bash
npm run build:analyze
```

### Preview Build
```bash
npm run preview
```

## Environment Variables

### Production
- `production: true`
- `enableGraphQL: false` (Statik data kullanır)
- `fallbackToStaticData: true`

### Development
- `production: false`
- `enableGraphQL: true` (GraphQL server gerekir)
- `fallbackToStaticData: true`

## Troubleshooting

### Build Hatası
1. `node_modules` sil ve `npm install` çalıştır
2. `ng build --configuration production --verbose` ile detaylı log al

### Deployment Hatası
1. Build output'u kontrol et: `dist/cv-angular/browser`
2. Routing için `.htaccess` dosyasının kopyalandığından emin ol

## Otomatik Deployment

### GitHub Actions (Opsiyonel)
```yaml
# .github/workflows/deploy.yml
name: Deploy CV App
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:prod
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```