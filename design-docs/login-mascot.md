# Maskot halaman Login

## Aset aktif

- Gambar: [aldera-cat-login.webp](../public/images/auth/aldera-cat-login.webp).
- Referensi karakter: [maskot Beranda](../public/images/hero/aldera-cat-hero.webp).
- Ukuran: 1024 × 1536 px; 228.170 byte; WebP kualitas 92 dengan transparansi alpha.
- Pembuatan: tool bawaan `imagegen`, menggunakan maskot Beranda sebagai referensi identitas. Sharp mengoptimalkan format WebP tanpa mengubah pose atau transparansi.
- Pose: satu kucing putih membawa kartu akses biru dengan simbol lubang kunci, sambil membuka tangan ke arah formulir di sebelah kanan.
- Identitas: bulu putih, kacamata hitam, headphone biru-hitam, hoodie dan celana putih bergaris merah-biru, sneakers putih, serta ekor berbulu.

## Penerapan

Komponen `app/(auth)/login/_components/login-experience.tsx` memakai static import Next Image. Pada desktop, ilustrasi mendominasi bagian tengah panel kiri dengan headline “Ide Anda. Kita wujudkan bersama.” di bawahnya. Pada tablet, teks berada di kiri bawah dan ilustrasi di kanan; pada HP ilustrasi disembunyikan. Gambar bersifat dekoratif dan tidak menambah urutan fokus. Animasi floating mengikuti `prefers-reduced-motion`.

## Prompt final

```text
Use case: identity-preserve. Asset type: production transparent 3D mascot illustration for the LOGIN page of Aldera Tech, a software engineering and digital studio. Input image 1 is the strict character identity and material reference, not the target pose. Create a NEW pose of exactly the SAME recognizable white cat: preserve its head and face proportions, fluffy pure white fur, pink nose and inner ears, black sunglasses, large black headphones with electric blue rings, white sporty hoodie with thin red and blue sleeve stripes, white knee-length shorts, white high-top sneakers, and fluffy tail. NEW POSE: a relaxed confident three-quarter standing pose, body turned slightly toward the viewer's RIGHT (where the website login form sits), one front foot making a small step forward. One paw holds a small translucent electric-blue access keycard at waist level; the card has ONLY a simple crisp keyhole symbol, no letters. The other arm extends gently toward the viewer's right with an open upward-facing palm, inviting the visitor to enter. Hands stay around waist/chest level, not waving above the head. Friendly cool and professional. No laptop, no speech bubble, no second cat, no duplicate limbs. Premium clean 3D illustration with crisp fine fur, soft high-quality fabric, balanced soft white studio light and subtle cool-blue fill, same exact polished material language as reference. Full body portrait 2:3 composition with the cat filling 92 percent of the canvas height, all ears, paws, shoes, card and tail fully visible, minimal clean 4 percent margins. Camera at eye level, slight perspective, natural plausible anatomy. Actual fully transparent alpha background: no scenery, no solid white background, no floor plane, no baked checkerboard, no surrounding halo or rectangular glow. Natural contact shading on the character only. No text, no brand logos, no watermark. The final cat should be strong and readable as a large hero-panel cutout.
```
