# Sprint Tamamlama Özeti Formatı

Her geliştirme sprintini tamamladıktan sonra son yanıtı aşağıdaki formatta hazırla.

Yanıt kısa, somut ve doğrulanabilir olsun. Planlanan işleri tamamlanmış gibi anlatma. Eksik bir madde varsa bunu açıkça belirt ve sprinti tamamlanmış olarak tanımlama.

## İstenen çıktı formatı

```markdown
Sprint [SPRINT NUMARASI / ADI] tamamlandı.

[Varsa yapılan önemli iyileştirmeleri veya sıkılaştırmaları tek cümleyle açıkla.]

Eklenen veya güncellenen başlıca özellikler:

- [Özellik 1]
- [Özellik 2]
- [Özellik 3]
- [Yaşam döngüsü, erişilebilirlik veya veri güvenliği iyileştirmesi]

[Görev birkaç aşama, ekran veya oyun içeriyorsa aşağıdaki numaralı listeyi ekle:]

1. [Aşama adı] — `[teknik tür/strateji]`, [oturum uzunluğu veya kapsam]
2. [Aşama adı] — `[teknik tür/strateji]`, [oturum uzunluğu veya kapsam]
3. [Aşama adı] — `[teknik tür/strateji]`, [oturum uzunluğu veya kapsam]

Doğrulama:

- **[BAŞARILI TEST]/[TOPLAM TEST] test başarılı**
- [Sözdizimi, lint veya build sonucu]
- [Telefon/tablet/masaüstü responsive sonucu]
- [Tarayıcı konsol sonucu]
- [Erişilebilirlik veya yinelenen kimlik kontrolü]
- [Kapsam dışı bırakılması gereken özelliğin uygulanmadığına dair doğrulama]

Başlıca güncellenen dosyalar:

- [dosya-adi.ext](C:/tam/yol/dosya-adi.ext)
- [diger-dosya.ext](C:/tam/yol/diger-dosya.ext)
- [test-dosyasi.test.js](C:/tam/yol/test-dosyasi.test.js)

Eksik veya çözülemeyen madde: [Yok / açık ve dürüst açıklama]
```

## Yazım kuralları

- Ürün veya sprint adını doğru kullan.
- İlk cümlede sonucu belirt.
- Yalnızca gerçekten uygulanmış özellikleri listele.
- Test sayılarını ve doğrulama sonuçlarını gerçek çıktılardan al.
- Değişen dosyaları mutlak ve tıklanabilir Markdown bağlantılarıyla göster.
- Dosya listesini yalnızca görevle ilgili başlıca dosyalarla sınırla.
- Kapsam dışında bırakılması istenen özellikleri açıkça doğrula.
- Commit, push veya PR oluşturulmadıysa oluşturulmuş gibi yazma.
- Gereksiz süreç anlatımı, uzun açıklama veya gelecek önerileri ekleme.
- Eksik iş varsa “tamamlandı” deme; eksik gereksinimi net biçimde listele.

## Kısa örnek

```markdown
Sprint 8.3.5.2 tamamlandı.

Sekiz öğrenme aşaması oynanabilir hâle getirildi; konuşma, duraklatma, tekrar oynama ve oyuncuya özel ilerleme mevcut akışa bağlandı.

Doğrulama:

- **111/111 test başarılı**
- JavaScript sözdizimi kontrolleri başarılı
- Telefon, tablet ve masaüstünde yatay taşma yok
- Tarayıcı konsol hatası yok
- Kapsam dışındaki sonraki sprint uygulanmadı

Başlıca güncellenen dosyalar:

- [Feature.js](C:/proje/js/Feature.js)
- [app.js](C:/proje/app.js)
- [feature.test.js](C:/proje/tests/feature.test.js)

Eksik veya çözülemeyen madde: Yok
```
