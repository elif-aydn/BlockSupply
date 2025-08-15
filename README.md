##  BlockSupply – Akıllı Kontrat Tabanlı E-Pazaryeri ve Tedarik Zinciri Uygulaması

**BlockSupply**, Ethereum blokzinciri üzerinde çalışan, *üretici*, *tüketici* ve *nakliyeci* rollerine sahip kullanıcıların merkeziyetsiz biçimde etkileşime girebildiği bir *e-pazaryeri ve tedarik zinciri platformudur*.

Bu proje, geleneksel pazar yerlerinde yaşanan güven, izlenebilirlik ve süreç takibi problemlerine çözüm üretmeyi amaçlar. Tüm işlemler, akıllı kontratlar aracılığıyla *şeffaf*, *güvenli* ve *doğrulanabilir* şekilde gerçekleşir.



###  Özellikler

**Rol Bazlı Giriş ve İşlem Yetkilendirmesi**

  * Kullanıcılar Metamask ile bağlanır ve `Producer`, `Buyer` veya `Shipper` rolünü seçerek sisteme kaydolur.
  * Roller kontrat düzeyinde kontrol edilir (`hasRole`, `modifier` vb.).

  **Üretici (Producer) Özellikleri**

  * Yeni ürün oluşturma (`createProduct`)
  * Kendi ürünlerini görüntüleme
  * Nakliyeci tekliflerini değerlendirme ve atama (`assignShipper`)

  **Tüketici (Buyer) Özellikleri**

  * Satışta olan ürünleri listeleme (`getAvailableProducts`)
  * Ürün satın alma (`buyProduct`)
  * Ürün teslimatı sonrası on-chain teslimat onayı (`confirmDelivery`)

  **Nakliyeci (Shipper) Özellikleri**

  * Satılmış ama atanması yapılmamış ürünlere taşıma teklifi gönderme (`requestShipping`)
  * Üretici tarafından atanma ve teslimat gerçekleştirme (`confirmTransport`)

**Akıllı Kontratlar Arası Entegrasyon**

  * `RolesManager`, `ProductManager`, `ShippingManager` kontratları birbiriyle entegre çalışır.
  * Solidity `enum`, `mapping`, `modifier` ve `struct` yapıları etkin şekilde kullanılmıştır.

Modern Frontend

  * React.js tabanlı sade ve işlevsel kullanıcı arayüzü
  * `ethers.js` ile kontrat etkileşimi
  * `WalletContext` ve `ActiveRoleContext` ile global cüzdan ve rol yönetimi
  * Kullanıcı dostu rol seçimi ve yönlendirme


###  Kullanılan Teknolojiler

| Katman            | Teknoloji            |
| ----------------- | -------------------- |
| Akıllı Kontratlar | Solidity, Hardhat    |
| Frontend          | React.js, Vite       |
| Web3 Etkileşimi   | Ethers.js, Metamask  |
| Test / Deploy     | Mocha, Chai, Hardhat |
| Stil / UI         | TailwindCSS / Custom |







