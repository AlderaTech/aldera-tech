# Mini maskot dashboard AI Relay

## Referensi dan produksi

Referensi utama adalah [maskot Beranda](../public/images/hero/aldera-cat-hero.webp), yang digunakan oleh `app/(public)/_components/home/hero-visual.tsx`. Ketiga aset dibuat dengan built-in `image_gen` melalui skill imagegen, masing-masing memakai gambar referensi yang sama. Mode CLI dan 9Router tidak digunakan.

Karakter mempertahankan kucing putih berbulu lembut, telinga/hidung/paw pink, kacamata hitam, headphone hitam dengan aksen biru, hoodie putih bergaris merah-biru, celana pendek, dan sneakers. Setiap pose memiliki properti yang berbeda. Output ber-alpha dioptimalkan menjadi WebP 512 × 512 melalui Sharp kualitas 90 dan alphaQuality 100; metadata tidak dibawa ke aset website.

| Aset                                                                                           | Pose / pemakaian                                | Ukuran      |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| [aldera-relay-connect.webp](../public/images/dashboard/ai-relay/aldera-relay-connect.webp)     | Memegang jaringan simpul koneksi; sambutan      | 50.170 byte |
| [aldera-relay-coding.webp](../public/images/dashboard/ai-relay/aldera-relay-coding.webp)       | Duduk mengetik pada laptop mini; dialog IDE     | 56.914 byte |
| [aldera-relay-assistant.webp](../public/images/dashboard/ai-relay/aldera-relay-assistant.webp) | Membawa gelembung percakapan; Playground kosong | 57.640 byte |

Alpha, dimensi, material, karakter, proporsi, dan keterbacaan pada ukuran kecil diperiksa. Aset tidak menggantikan konten/model/data proyek dengan gambar raster. Ketiganya dirender oleh `RelayMascot` sebagai dekorasi dengan alt kosong, aria-hidden, serta pointer-events none.

## Prompt final

Setiap varian menggunakan prompt dasar berikut, diikuti instruksi pose masing-masing. Semua pemanggilan memakai `transparent_background=true` dan referensi Beranda.

```text
Use case: identity-preserve. Asset type: production transparent 3D mini mascot for Aldera Tech client AI Relay dashboard. Input image is the authoritative same-character reference. Preserve the exact white cat identity, fluffy white fur, pink nose/ears/paws, black sunglasses, big black headphones with electric blue illuminated trim, sporty white hoodie with red and royal blue stripes, white shorts and sneakers, cheerful confident face, proportions and premium polished 3D rendering. Create a NEW pose of this same cat, not a new character. Full subject entirely visible and centered, compact square framing designed to be readable at 96-128px on a light dashboard. Consistent soft upper-left studio key light, restrained blue rim and soft dimensional self-shadowing. True transparent alpha outside silhouette, clean anti-aliased edges, NO opaque background, no grid, no stage, no pedestal, no extra cats, no robot, no watermark, no other letters.
```

Koneksi:

```text
Pose: standing in a friendly three-quarter front view, both paws visibly holding a small glowing blue connection node network at chest level: one central blue glass node with three thin arcs to smaller nodes. Keep the object small, readable and naturally held; face unobstructed. The visual communicates connecting model providers through one gateway, without provider logos.
```

Coding:

```text
Pose: sitting comfortably with legs forward and a tiny silver laptop resting on knees, paws naturally typing. Laptop lid tilted enough to show a single simple blue '</>' code symbol on the back facing viewer. Cat looks toward viewer with a small welcoming smile, all ears, tail and sneakers visible. No extra floating decorations.
```

Asisten:

```text
Pose: playfully leaning a little toward viewer and gently holding one small pale blue glass speech bubble with three blue dots, the other paw welcoming. Cute confident same-character assistant, full body in compact framing, sunglasses and headphones unobstructed. One speech bubble only, no other props.
```
