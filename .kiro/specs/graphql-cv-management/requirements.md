# Requirements Document

## Introduction

Bu proje, mevcut Angular CV uygulamasının GraphQL backend'ini production ortamında deploy edilebilir hale getirmeyi ve CV verilerinin dinamik olarak yönetilebilmesini sağlamayı amaçlamaktadır. Uygulama deploy edildikten sonra bile CV bilgilerinin GraphQL API üzerinden güncellenebilmesi hedeflenmektedir.

## Requirements

### Requirement 1

**User Story:** Bir geliştirici olarak, CV verilerimi production ortamında GraphQL API üzerinden yönetebilmek istiyorum, böylece uygulamayı yeniden deploy etmeden CV'mi güncelleyebilirim.

#### Acceptance Criteria

1. WHEN production ortamında GraphQL endpoint'ine erişildiğinde THEN CV verileri dinamik olarak dönmeli
2. WHEN CV verileri GraphQL üzerinden güncellendiğinde THEN değişiklikler anında yansımalı
3. WHEN uygulama yeniden başlatıldığında THEN güncellenmiş veriler korunmalı

### Requirement 2

**User Story:** Bir CV sahibi olarak, sadece benim bildiğim kullanıcı adı ve şifre ile CV verilerimi güncelleyebilmek istiyorum, böylece yetkisiz erişimleri engelleyebilirim.

#### Acceptance Criteria

1. WHEN command menu'de admin login seçeneği seçildiğinde THEN login formu açılmalı
2. WHEN yanlış kullanıcı adı/şifre girildiğinde THEN hata mesajı gösterilmeli
3. WHEN doğru credentials girildiğinde THEN admin paneli açılmalı
4. WHEN admin paneli açıkken THEN CV verilerini düzenleyebilmeli

### Requirement 3

**User Story:** Bir kullanıcı olarak, CV verilerinin kalıcı olarak saklanmasını istiyorum, böylece verilerim kaybolmasın.

#### Acceptance Criteria

1. WHEN CV verileri güncellendiğinde THEN database'e kaydedilmeli
2. WHEN server yeniden başlatıldığında THEN veriler database'den yüklenmeli
3. IF database bağlantısı kesilirse THEN fallback olarak statik data kullanılmalı

### Requirement 4

**User Story:** Bir geliştirici olarak, GraphQL server'ı production ortamında deploy edebilmek istiyorum, böylece canlı ortamda kullanabileyim.

#### Acceptance Criteria

1. WHEN GraphQL server deploy edildiğinde THEN production environment'da çalışmalı
2. WHEN Angular app production'da çalıştığında THEN GraphQL endpoint'ine bağlanabilmeli
3. WHEN deployment tamamlandığında THEN hem frontend hem backend erişilebilir olmalı

### Requirement 5

**User Story:** Bir geliştirici olarak, CV verilerini GraphQL üzerinden CRUD operasyonları ile yönetebilmek istiyorum, böylece tam kontrol sahibi olabileyim.

#### Acceptance Criteria

1. WHEN query çağrıldığında THEN mevcut CV verileri dönmeli
2. WHEN mutation ile veri güncellendiğinde THEN değişiklikler kaydedilmeli
3. WHEN subscription kullanıldığında THEN real-time güncellemeler alınabilmeli

### Requirement 6

**User Story:** Bir geliştirici olarak, GraphQL API'sini test edebilmek istiyorum, böylece doğru çalıştığından emin olabileyim.

#### Acceptance Criteria

1. WHEN GraphQL Playground/Studio açıldığında THEN schema görüntülenebilmeli
2. WHEN test query'leri çalıştırıldığında THEN doğru sonuçlar dönmeli
3. WHEN mutation test edildiğinde THEN veriler güncellenebilmeli

### Requirement 7

**User Story:** Bir sistem yöneticisi olarak, GraphQL server'ın performansını izleyebilmek istiyorum, böylece sorunları önceden tespit edebilirim.

#### Acceptance Criteria

1. WHEN server çalıştığında THEN health check endpoint'i erişilebilir olmalı
2. WHEN yoğun trafik olduğunda THEN server stabil çalışmalı
3. WHEN hata oluştuğunda THEN loglar kaydedilmeli

### Requirement 8

**User Story:** Bir geliştirici olarak, environment-specific konfigürasyonlar kullanabilmek istiyorum, böylece development ve production ayarlarını ayırabilirim.

#### Acceptance Criteria

1. WHEN development ortamında THEN local database kullanılmalı
2. WHEN production ortamında THEN cloud database kullanılmalı
3. WHEN environment değişkenleri ayarlandığında THEN doğru konfigürasyon yüklenmeli

### Requirement 9

**User Story:** Bir geliştirici olarak, CV verilerinin backup'ını alabilmek istiyorum, böylece veri kaybını engelleyebilirim.

#### Acceptance Criteria

1. WHEN backup komutu çalıştırıldığında THEN CV verileri export edilmeli
2. WHEN restore komutu çalıştırıldığında THEN backup'tan veriler yüklenmeli
3. WHEN otomatik backup aktifse THEN düzenli aralıklarla backup alınmalı

### Requirement 10

**User Story:** Bir CV sahibi olarak, admin paneli üzerinden CV verilerimi kolayca düzenleyebilmek istiyorum, böylece teknik bilgi gerektirmeden güncelleyebilirim.

#### Acceptance Criteria

1. WHEN admin panelinde THEN tüm CV bölümleri (kişisel bilgiler, deneyim, eğitim, projeler, yetenekler) düzenlenebilir formlar olmalı
2. WHEN form doldurulup kaydedildiğinde THEN değişiklikler GraphQL üzerinden backend'e gönderilmeli
3. WHEN kaydetme işlemi tamamlandığında THEN CV anında güncellenmiş haliyle görüntülenmeli
4. WHEN admin panelinden çıkıldığında THEN normal CV görünümüne dönülmeli

### Requirement 11

**User Story:** Bir kullanıcı olarak, CV güncellemelerinin real-time olarak yansımasını istiyorum, böylece değişiklikleri anında görebilirim.

#### Acceptance Criteria

1. WHEN CV verileri admin panelinden güncellendiğinde THEN ana CV görünümü otomatik olarak güncellemeli
2. WHEN kaydetme işlemi başarılıysa THEN başarı mesajı gösterilmeli
3. WHEN kaydetme işlemi başarısızsa THEN hata mesajı gösterilmeli