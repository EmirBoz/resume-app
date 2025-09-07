# Requirements Document

## Introduction

Bu proje, mevcut Next.js tabanlı CV uygulamasının Angular versiyonunu oluşturmayı amaçlamaktadır. Angular'ın en güncel versiyonu (v20) ve modern özelliklerini kullanarak, minimalist, yazdırma dostu, tek sayfalık bir CV/Resume web uygulaması geliştirilecektir. Uygulama responsive tasarım, SEO optimizasyonu, klavye navigasyonu ve GraphQL API desteği içerecektir.

## Requirements

### Requirement 1

**User Story:** Bir geliştirici olarak, kişisel bilgilerimi tek bir konfigürasyon dosyasından yönetebilmek istiyorum, böylece CV'mi kolayca güncelleyebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı konfigürasyon dosyasını düzenlediğinde THEN sistem otomatik olarak CV'yi güncellemeli
2. WHEN konfigürasyon dosyası yüklendiğinde THEN sistem tüm kişisel bilgileri, iş deneyimlerini, eğitim bilgilerini, yetenekleri ve projeleri görüntülemeli
3. IF konfigürasyon dosyasında eksik alan varsa THEN sistem varsayılan değerleri kullanmalı veya alanı gizlemeli

### Requirement 2

**User Story:** Bir kullanıcı olarak, CV'mi farklı cihazlarda (mobil, tablet, desktop) optimal şekilde görüntüleyebilmek istiyorum, böylece her platformda profesyonel görünüm elde edebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı mobil cihazdan eriştiğinde THEN CV responsive tasarımla görüntülenmeli
2. WHEN kullanıcı tablet veya desktop'tan eriştiğinde THEN CV uygun layout ile görüntülenmeli
3. WHEN ekran boyutu değiştiğinde THEN bileşenler otomatik olarak yeniden düzenlenmeli

### Requirement 3

**User Story:** Bir kullanıcı olarak, CV'mi yazdırabilmek istiyorum, böylece fiziksel kopyasını elde edebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı yazdırma işlemi başlattığında THEN CV yazdırma için optimize edilmiş görünümde olmalı
2. WHEN yazdırma modunda THEN gereksiz UI elementleri (navigasyon, butonlar) gizlenmeli
3. WHEN yazdırıldığında THEN sayfa düzeni ve fontlar yazdırma için uygun olmalı

### Requirement 4

**User Story:** Bir kullanıcı olarak, klavye kısayolları ile CV'de hızlı navigasyon yapabilmek istiyorum, böylece daha verimli kullanım sağlayabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı Cmd/Ctrl+K tuşlarına bastığında THEN komut menüsü açılmalı
2. WHEN komut menüsü açıkken THEN kullanıcı farklı bölümlere hızlıca geçebilmeli
3. WHEN komut menüsünde THEN sosyal medya linklerine ve yazdırma fonksiyonuna erişebilmeli

### Requirement 5

**User Story:** Bir geliştirici olarak, CV verilerine programatik olarak erişebilmek istiyorum, böylece API entegrasyonları yapabileyim.

#### Acceptance Criteria

1. WHEN GraphQL endpoint'ine istek gönderildiğinde THEN CV verileri JSON formatında dönmeli
2. WHEN API sorgusu yapıldığında THEN tüm CV bölümleri (kişisel bilgiler, deneyim, eğitim, projeler) erişilebilir olmalı
3. IF API'da hata oluşursa THEN uygun hata mesajları dönmeli

### Requirement 6

**User Story:** Bir kullanıcı olarak, CV'nin arama motorlarında iyi görünmesini istiyorum, böylece online varlığımı güçlendirebilirim.

#### Acceptance Criteria

1. WHEN arama motoru CV'yi taradığında THEN uygun meta veriler bulunmalı
2. WHEN sosyal medyada paylaşıldığında THEN Open Graph ve Twitter Card verileri görüntülenmeli
3. WHEN structured data tarandığında THEN JSON-LD formatında kişi bilgileri bulunmalı

### Requirement 7

**User Story:** Bir kullanıcı olarak, uygulama hata verdiğinde bilgilendirilmek istiyorum, böylece ne olduğunu anlayabileyim.

#### Acceptance Criteria

1. WHEN herhangi bir bileşende hata oluştuğunda THEN error boundary devreye girmeli
2. WHEN hata yakalandığında THEN kullanıcıya anlaşılır hata mesajı gösterilmeli
3. WHEN hata oluştuğunda THEN diğer bileşenler çalışmaya devam etmeli

### Requirement 8

**User Story:** Bir kullanıcı olarak, sayfa yüklenirken loading durumunu görebilmek istiyorum, böylece uygulamanın çalıştığını bilebilirim.

#### Acceptance Criteria

1. WHEN sayfa yüklenirken THEN her bölüm için skeleton loader görüntülenmeli
2. WHEN veri yüklendiğinde THEN skeleton loader gerçek içerikle değiştirilmeli
3. WHEN yavaş bağlantıda THEN loading durumu uygun süre gösterilmeli

### Requirement 9

**User Story:** Bir geliştirici olarak, modern Angular özelliklerini kullanmak istiyorum, böylece en iyi geliştirici deneyimini elde edebilirim.

#### Acceptance Criteria

1. WHEN proje oluşturulduğunda THEN Angular 20 versiyonu kullanılmalı
2. WHEN bileşenler geliştirildiğinde THEN standalone components kullanılmalı
3. WHEN state yönetimi gerektiğinde THEN Angular Signals kullanılmalı
4. WHEN HTTP istekleri yapıldığında THEN yeni HttpClient kullanılmalı

### Requirement 10

**User Story:** Bir kullanıcı olarak, CV'deki sosyal medya linklerine kolayca erişebilmek istiyorum, böylece kişiyle iletişim kurabilirim.

#### Acceptance Criteria

1. WHEN sosyal medya ikonlarına tıklandığında THEN yeni sekmede ilgili profil açılmalı
2. WHEN ikonlar görüntülendiğinde THEN erişilebilirlik için uygun aria-label'lar bulunmalı
3. WHEN print modunda THEN sosyal medya linkleri metin olarak görüntülenmeli

### Requirement 11

**User Story:** Bir kullanıcı olarak, CV'mi PDF formatında kaydedebilmek istiyorum, böylece dijital kopyasını paylaşabileyim.

#### Acceptance Criteria

1. WHEN kullanıcı PDF kaydetme butonuna tıkladığında THEN CV otomatik olarak PDF formatında indirilmeli
2. WHEN PDF oluşturulduğunda THEN yazdırma için optimize edilmiş görünüm kullanılmalı
3. WHEN PDF kaydedildiğinde THEN dosya adı kişinin adını içermeli (örn: "John_Doe_CV.pdf")
4. WHEN PDF oluşturulurken THEN sayfa düzeni ve formatlaması korunmalı