import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  defaultPricingPlans,
  defaultSiteSettings,
  SITE_SETTING_ID,
} from "../lib/public-settings";

async function main() {
  console.log("🌱 Seeding database…");

  const defaultPassword = "password";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Clean up legacy seeded users that may linger from older seed runs.
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "budi@example.com",
          "admin@solvo.tech",
          "dev@solvo.tech",
          "siti@example.com",
        ],
      },
    },
  });

  // ----------------------------------------------------------------
  // 1. Staff Users (ADMIN & DEVELOPER)
  // ----------------------------------------------------------------
  const staffGading = await prisma.user.upsert({
    where: { email: "gading@gmail.com" },
    update: {
      name: "Alfian Gading Saputra",
      phone: "0895363116378",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "gading@gmail.com",
      name: "Alfian Gading Saputra",
      phone: "0895363116378",
      company: "Solvo Tech",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "dery@gmail.com" },
    update: {
      name: "Dery Wahyu Perdana",
      phone: "082377341268",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "dery@gmail.com",
      name: "Dery Wahyu Perdana",
      phone: "082377341268",
      company: "Solvo Tech",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "rafli@gmail.com" },
    update: {
      name: "Rafli Maulana",
      phone: "085367271303",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "rafli@gmail.com",
      name: "Rafli Maulana",
      phone: "085367271303",
      company: "Solvo Tech",
      roles: ["ADMIN", "DEVELOPER"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // ----------------------------------------------------------------
  // 2. Client Users (CLIENT)
  // ----------------------------------------------------------------
  const clientGading = await prisma.user.upsert({
    where: { email: "gading-client@gmail.com" },
    update: {
      name: "Gading",
      phone: "0895363116378",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "gading-client@gmail.com",
      name: "Gading",
      phone: "0895363116378",
      company: "Kopi Kenangan Nusantara",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const clientDery = await prisma.user.upsert({
    where: { email: "dery-client@gmail.com" },
    update: {
      name: "Dery",
      phone: "082377341268",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "dery-client@gmail.com",
      name: "Dery",
      phone: "082377341268",
      company: "Batik Nusantara Collective",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "rafli-client@gmail.com" },
    update: {
      name: "Rafli",
      phone: "085367271303",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
    },
    create: {
      email: "rafli-client@gmail.com",
      name: "Rafli",
      phone: "085367271303",
      company: "FinSmart Digital",
      roles: ["CLIENT"],
      password: hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const admin = staffGading;
  const client1 = clientGading;
  const client2 = clientDery;

  console.log("✔ Users seeded");

  // ----------------------------------------------------------------
  // Public website settings + pricing
  // ----------------------------------------------------------------
  await prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    update: {},
    create: {
      id: SITE_SETTING_ID,
      brandName: defaultSiteSettings.brandName,
      footerDescription: defaultSiteSettings.footerDescription,
      email: defaultSiteSettings.email || null,
      phone: defaultSiteSettings.phone || null,
      whatsapp: defaultSiteSettings.whatsapp || null,
      address: defaultSiteSettings.address || null,
      mapsUrl: defaultSiteSettings.mapsUrl || null,
      operatingHours: defaultSiteSettings.operatingHours || null,
      responseTime: defaultSiteSettings.responseTime,
      githubUrl: defaultSiteSettings.githubUrl || null,
      linkedinUrl: defaultSiteSettings.linkedinUrl || null,
      instagramUrl: defaultSiteSettings.instagramUrl || null,
      seoTitle: defaultSiteSettings.seoTitle,
      seoDescription: defaultSiteSettings.seoDescription,
    },
  });

  for (const plan of defaultPricingPlans) {
    const saved = await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: {
        slug: plan.slug,
        name: plan.name,
        tagline: plan.tagline,
        priceFrom: plan.priceFrom,
        featured: plan.featured,
        ctaLabel: plan.ctaLabel,
        ctaHref: plan.ctaHref,
        order: plan.order,
      },
      select: { id: true },
    });
    const featureCount = await prisma.pricingPlanFeature.count({
      where: { planId: saved.id },
    });
    if (featureCount === 0) {
      await prisma.pricingPlanFeature.createMany({
        data: plan.features.map((feature) => ({
          planId: saved.id,
          text: feature.text,
          included: feature.included,
          order: feature.order,
        })),
      });
    }
  }

  console.log("✔ Public settings and pricing seeded");

  // ----------------------------------------------------------------
  // Projects + Milestones + Activity Logs
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();

  const project1 = await prisma.project.create({
    data: {
      title: "Website E-Commerce Kopi Kenangan",
      description:
        "Platform e-commerce lengkap untuk Kopi Kenangan Nusantara dengan integrasi pembayaran, manajemen inventory, dan dashboard admin.",
      status: "IN_PROGRESS",
      progress: 65,
      clientId: client1.id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: "25000000",
      milestones: {
        create: [
          {
            title: "Discovery & Wireframing",
            description: "Riset kebutuhan, persona, dan wireframe awal.",
            status: "COMPLETED",
            order: 1,
            dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
          },
          {
            title: "UI/UX Design",
            description:
              "Desain high-fidelity di Figma, siap untuk development.",
            status: "COMPLETED",
            order: 2,
            dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Frontend Development",
            description: "Implementasi halaman storefront dan product detail.",
            status: "IN_PROGRESS",
            order: 3,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Backend + Payment",
            description: "API, integrasi Midtrans, dan order management.",
            status: "PENDING",
            order: 4,
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          },
          {
            title: "QA & Launch",
            description: "Testing, staging, deployment produksi.",
            status: "PENDING",
            order: 5,
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Mobile App Batik Nusantara",
      description:
        "Aplikasi mobile iOS & Android untuk showcase dan penjualan batik dengan fitur AR preview.",
      status: "PENDING",
      progress: 10,
      clientId: client2.id,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: "45000000",
      milestones: {
        create: [
          {
            title: "Riset & Prototype",
            description: "Riset user, prototype interaktif, validasi konsep.",
            status: "IN_PROGRESS",
            order: 1,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Desain Visual",
            status: "PENDING",
            order: 2,
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Development",
            status: "PENDING",
            order: 3,
            dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Activity logs for project1
  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project1.id,
        userId: admin.id,
        action: "PROJECT_CREATED",
        description: "Proyek dibuat dan client di-assign.",
      },
      {
        projectId: project1.id,
        userId: admin.id,
        action: "MILESTONE_COMPLETED",
        description: "Milestone 'Discovery & Wireframing' selesai.",
      },
      {
        projectId: project1.id,
        userId: admin.id,
        action: "MILESTONE_COMPLETED",
        description: "Milestone 'UI/UX Design' selesai.",
      },
      {
        projectId: project1.id,
        userId: admin.id,
        action: "PROGRESS_UPDATED",
        description: "Progress diperbarui menjadi 65%.",
      },
      {
        projectId: project1.id,
        userId: admin.id,
        action: "NOTE_ADDED",
        description:
          "Integrasi Midtrans terkonfirmasi, menunggu approval API key.",
      },
    ],
  });

  console.log("✔ Projects + milestones + activity logs seeded");

  // ----------------------------------------------------------------
  // Blog Categories + Posts
  // ----------------------------------------------------------------
  const catDev = await prisma.blogCategory.upsert({
    where: { slug: "development" },
    update: {},
    create: {
      slug: "development",
      name: "Development",
      description: "Tips pengembangan.",
    },
  });
  const catDesign = await prisma.blogCategory.upsert({
    where: { slug: "design" },
    update: {},
    create: {
      slug: "design",
      name: "Design",
      description: "UI/UX dan design system.",
    },
  });
  const catBiz = await prisma.blogCategory.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      slug: "business",
      name: "Business",
      description: "Strategi digital untuk bisnis.",
    },
  });

  const blogSeeds = [
    {
      slug: "kenapa-bisnis-anda-butuh-website-modern",
      title: "Kenapa Bisnis Anda Butuh Website Modern di 2026",
      excerpt:
        "Website bukan sekedar etalase digital. Ini adalah mesin pertumbuhan yang bekerja 24/7 untuk bisnis Anda.",
      content:
        "<h2>Website sebagai Aset Bisnis</h2><p>Di era digital, kehadiran online bukan lagi opsional. Pelanggan mencari informasi, membandingkan harga, dan mengambil keputusan pembelian, semuanya online.</p><p>Website modern bukan sekedar tampil cantik. Ia perlu <strong>cepat</strong>, <strong>mobile-friendly</strong>, dan <strong>SEO-optimized</strong> agar ditemukan oleh audiens yang tepat.</p><h3>Manfaat Konkret</h3><ul><li>Meningkatkan kredibilitas brand.</li><li>Menghasilkan leads otomatis.</li><li>Mengurangi beban customer service.</li></ul><p>Solvo Tech membantu bisnis Indonesia membangun website yang bukan sekedar ada, tapi <em>bekerja</em>.</p>",
      categoryId: catBiz.id,
      featuredImage: "/generated/solvo-tech/blog/modern-website-strategy.png",
      published: true,
    },
    {
      slug: "next-js-16-apa-yang-baru",
      title: "Next.js 16: Apa yang Baru dan Kenapa Penting?",
      excerpt:
        "Turbopack default, async request APIs, dan proxy menggantikan middleware. Inilah yang perlu Anda tahu.",
      content:
        "<h2>Turbopack Stable</h2><p>Dimulai dari v16, Turbopack menjadi default untuk <code>next dev</code> dan <code>next build</code>. Kecepatan compile meningkat drastis.</p><h2>Async Request APIs</h2><p>Semua <code>cookies()</code>, <code>headers()</code>, <code>params</code>, dan <code>searchParams</code> sekarang Promises. Wajib di-await.</p><h2>middleware → proxy</h2><p>File <code>middleware.ts</code> sekarang bernama <code>proxy.ts</code>. Tidak lagi mendukung edge runtime secara default.</p>",
      categoryId: catDev.id,
      featuredImage: "/generated/solvo-tech/blog/nextjs-16-development.png",
      published: true,
    },
    {
      slug: "micro-interactions-yang-meningkatkan-ux",
      title: "5 Micro-interactions yang Bikin UX Anda Menonjol",
      excerpt:
        "Detail kecil yang membuat produk digital terasa premium. Dari hover feedback sampai loading state yang elegan.",
      content:
        "<h2>Apa itu Micro-interactions?</h2><p>Animasi kecil yang memberikan feedback atau guidance ke user, tombol yang 'menekan', progress bar yang halus, toast yang slide-in.</p><h3>Top 5 Pilihan</h3><ol><li>Hover scale pada card (scale: 1.02).</li><li>Progress bar dengan easing smooth.</li><li>Skeleton loading menggantikan spinner.</li><li>Stagger animation pada list items.</li><li>Active state yang spring-based.</li></ol>",
      categoryId: catDesign.id,
      featuredImage: "/generated/solvo-tech/blog/micro-interactions-ux.png",
      published: true,
    },
  ];

  for (const post of blogSeeds) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        featuredImage: post.featuredImage,
      },
      create: {
        ...post,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
  }

  console.log("✔ Blog posts seeded");

  // ----------------------------------------------------------------
  // Testimonials
  // ----------------------------------------------------------------
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "Andi Wijaya",
        clientRole: "CEO",
        company: "TechNova Indonesia",
        content:
          "Solvo Tech benar-benar mengerti visi kami. Dashboard yang transparan membuat saya selalu tahu progres proyek tanpa harus chat berkali-kali.",
        rating: 5,
        order: 1,
      },
      {
        clientName: "Linda Kusuma",
        clientRole: "Founder",
        company: "Kopi Kita",
        content:
          "Tim yang profesional dan komunikatif. Dari discovery sampai launch, semuanya on time dan on budget.",
        rating: 5,
        order: 2,
      },
      {
        clientName: "Ridho Pratama",
        clientRole: "Product Manager",
        company: "FinSmart",
        content: "Kualitas kode dan desainnya jempolan. Worth every rupiah.",
        rating: 5,
        order: 3,
      },
      {
        clientName: "Maya Lestari",
        clientRole: "Marketing Director",
        company: "Urban Batik",
        content:
          "Mereka bukan sekedar ngoding, mereka jadi partner strategis. Highly recommended!",
        rating: 5,
        order: 4,
      },
    ],
  });

  console.log("✔ Testimonials seeded");

  // ----------------------------------------------------------------
  // Case Studies
  // ----------------------------------------------------------------
  const caseStudies = [
    {
      slug: "technova-b2b-platform",
      title: "TechNova: Platform B2B yang Men-Triple Revenue",
      client: "TechNova Indonesia",
      industry: "B2B SaaS",
      summary:
        "Membangun platform B2B lengkap yang meningkatkan konversi enterprise lead 3x.",
      challenge:
        "TechNova mengalami bottleneck pada proses sales enterprise, dari lead ke deal butuh 6+ bulan dengan banyak touchpoint manual.",
      solution:
        "Kami membangun dashboard B2B dengan self-serve onboarding, usage analytics real-time, dan integrasi billing. Sales team dibebaskan dari tugas administratif.",
      result:
        "Konversi lead ke deal naik 300%. Waktu onboarding turun dari 14 hari ke 2 hari. NPS customer naik dari 32 ke 68.",
      featuredImage:
        "/generated/solvo-tech/portfolio/technova-b2b-platform.png",
      techStack: ["Next.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
      published: true,
      order: 1,
    },
    {
      slug: "kopi-kita-ecommerce",
      title: "Kopi Kita: E-Commerce yang Menggandakan Penjualan Online",
      client: "Kopi Kita",
      industry: "F&B E-Commerce",
      summary:
        "Storefront modern dengan integrasi payment + delivery yang mulus.",
      challenge:
        "Kopi Kita hanya mengandalkan marketplace. Margin tipis dan tidak bisa membangun relationship langsung dengan customer.",
      solution:
        "Storefront custom dengan Midtrans, integrasi kurir, loyalty program, dan newsletter otomatis untuk repeat customer.",
      result:
        "Penjualan online naik 2x dalam 3 bulan. 40% repeat purchase rate. CAC turun 35%.",
      featuredImage: "/generated/solvo-tech/portfolio/kopi-kita-ecommerce.png",
      techStack: ["Next.js", "Prisma", "Midtrans", "PostgreSQL"],
      published: true,
      order: 2,
    },
    {
      slug: "finsmart-mobile-app",
      title: "FinSmart: Mobile App yang Meraih 100K Download",
      client: "FinSmart",
      industry: "FinTech",
      summary:
        "Aplikasi finance personal dengan UX yang membuat budgeting jadi mudah.",
      challenge:
        "Kompetitor banyak, fitur sudah commodity. FinSmart butuh diferensiasi yang kuat.",
      solution:
        "Fokus pada micro-interactions dan visualisasi data yang delightful. Setiap aksi memberi feedback yang memuaskan.",
      result:
        "100K+ download dalam 6 bulan. Rating 4.8 di App Store. Featured di 'Editor's Choice'.",
      featuredImage: "/generated/solvo-tech/portfolio/finsmart-mobile-app.png",
      techStack: ["React Native", "TypeScript", "Firebase", "Framer Motion"],
      published: true,
      order: 3,
    },
  ];

  for (const cs of caseStudies) {
    await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: {
        featuredImage: cs.featuredImage,
      },
      create: cs,
    });
  }

  console.log("✔ Case studies seeded");

  // ----------------------------------------------------------------
  // Invoices
  // ----------------------------------------------------------------
  const year = new Date().getFullYear();

  // Paid invoice
  await prisma.invoice.create({
    data: {
      number: `INV-${year}-0001`,
      status: "PAID",
      issueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      subtotal: "12500000",
      taxRate: "11",
      taxAmount: "1375000",
      total: "13875000",
      currency: "IDR",
      clientId: client1.id,
      projectId: project1.id,
      notes: "Pembayaran termin 1, Discovery + Design.",
      items: {
        create: [
          {
            description: "Discovery & Wireframing",
            quantity: "1",
            price: "5000000",
            total: "5000000",
            order: 1,
          },
          {
            description: "UI/UX Design (10 halaman)",
            quantity: "10",
            price: "750000",
            total: "7500000",
            order: 2,
          },
        ],
      },
    },
  });

  // Sent invoice
  await prisma.invoice.create({
    data: {
      number: `INV-${year}-0002`,
      status: "SENT",
      issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      subtotal: "8000000",
      taxRate: "11",
      taxAmount: "880000",
      total: "8880000",
      currency: "IDR",
      clientId: client1.id,
      projectId: project1.id,
      notes: "Pembayaran termin 2, Frontend development.",
      items: {
        create: [
          {
            description: "Frontend Development (milestone 3)",
            quantity: "1",
            price: "8000000",
            total: "8000000",
            order: 1,
          },
        ],
      },
    },
  });

  // Draft invoice for client2
  await prisma.invoice.create({
    data: {
      number: `INV-${year}-0003`,
      status: "DRAFT",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subtotal: "7500000",
      taxRate: "11",
      taxAmount: "825000",
      total: "8325000",
      currency: "IDR",
      clientId: client2.id,
      projectId: project2.id,
      notes: "Pembayaran awal, Riset & Prototype.",
      items: {
        create: [
          {
            description: "User Research & Prototype",
            quantity: "1",
            price: "7500000",
            total: "7500000",
            order: 1,
          },
        ],
      },
    },
  });

  console.log("✔ Invoices seeded");

  // --- Calculator Config & Data ---
  await prisma.calculatorConfig.upsert({
    where: { id: "calculator" },
    update: {},
    create: {
      featureDisclaimer:
        'Satu input = satu fitur spesifik.\n✓ Contoh benar: "Login dengan Google"\n✗ Contoh salah: "Sistem login lengkap dengan social media, 2FA, dan forgot password"\n\nJika fitur terlalu besar, tim kami akan memecahnya saat review.',
      revisionPolicy:
        "• Bug dari Solvo Tech = revisi gratis tanpa batas\n• Revisi dari Anda = 2x gratis (1 revisi = 1 fitur)\n• Revisi tambahan = Rp 300.000/fitur\n• Contoh: Jika Anda ingin merevisi 3 fitur sekaligus, itu menggunakan 3 jatah revisi.",
      freeRevisions: 2,
      revisionPricePerItem: 300000,
      urgencyMultiplier: 1.5,
      urgencyThresholdDays: 14,
      dpPercentage: 25,
    },
  });

  await prisma.featureOption.deleteMany();
  await prisma.addOnOption.deleteMany();
  await prisma.projectType.deleteMany();

  await prisma.projectType.create({
    data: {
      name: "Website",
      slug: "website",
      description: "Website company profile, landing page, atau web app",
      basePrice: 5000000,
      icon: "code2",
      dependentFields: [
        {
          label: "Jumlah Halaman",
          type: "number",
          pricePerUnit: 500000,
          unit: "halaman",
          min: 1,
          max: 50,
        },
      ],
      order: 0,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "Mobile App",
      slug: "mobile-app",
      description: "Aplikasi Android/iOS dengan React Native",
      basePrice: 8000000,
      icon: "smartphone",
      dependentFields: [
        {
          label: "Jumlah Screen",
          type: "number",
          pricePerUnit: 600000,
          unit: "screen",
          min: 1,
          max: 40,
        },
      ],
      order: 1,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "Tugas Kampus/Sekolah",
      slug: "tugas-kampus",
      description: "Tugas pemrograman, skripsi, atau proyek akademik",
      basePrice: 500000,
      icon: "fileText",
      dependentFields: [
        {
          label: "Jumlah Modul/BAB",
          type: "number",
          pricePerUnit: 200000,
          unit: "modul",
          min: 1,
          max: 20,
        },
      ],
      order: 2,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "Custom / Lainnya",
      slug: "custom",
      description: "Proyek khusus yang tidak masuk kategori di atas",
      basePrice: 3000000,
      icon: "settings",
      dependentFields: [],
      order: 3,
    },
  });

  // Standard features (all project types)
  const standardFeatures = [
    { name: "Login / Register", price: 500000 },
    { name: "Dashboard Admin", price: 1000000 },
    { name: "Upload File", price: 500000 },
    { name: "Notifikasi Email", price: 500000 },
    { name: "Search & Filter", price: 500000 },
    { name: "CRUD Data", price: 500000 },
    { name: "Export PDF/Excel", price: 500000 },
  ];
  for (let i = 0; i < standardFeatures.length; i++) {
    await prisma.featureOption.create({
      data: { ...standardFeatures[i], order: i, isMajor: false },
    });
  }

  // Major features
  const majorFeatures = [
    {
      name: "Integrasi Payment Gateway",
      price: 3000000,
      disclaimer:
        "Termasuk Midtrans/Xendit. Stripe atau gateway lain mungkin berbeda harga.",
    },
    {
      name: "Integrasi API Pihak Ketiga",
      price: 2000000,
      disclaimer:
        "Satu integrasi per item. Jika butuh 3 API berbeda, tambahkan 3x.",
    },
    { name: "Real-time Chat", price: 2500000 },
    { name: "Multi-language (i18n)", price: 1500000 },
    { name: "Sistem Role & Permission", price: 1500000 },
  ];
  for (let i = 0; i < majorFeatures.length; i++) {
    await prisma.featureOption.create({
      data: {
        ...majorFeatures[i],
        order: standardFeatures.length + i,
        isMajor: true,
      },
    });
  }

  // Add-ons
  await prisma.addOnOption.create({
    data: {
      name: "Domain + Deploy",
      description: "Termasuk domain .com/.id dan hosting/deploy ke server",
      pricePerMonth: 150000,
      minMonths: 3,
      maxMonths: 12,
      order: 0,
    },
  });
  await prisma.addOnOption.create({
    data: {
      name: "Maintenance",
      description: "Pemeliharaan rutin, update keamanan, dan monitoring",
      pricePerMonth: 500000,
      minMonths: 1,
      maxMonths: 12,
      order: 1,
    },
  });

  console.log("✔ Calculator config & data seeded");

  console.log("\n✅ Seeding complete!");
  console.log("\n--- Akun Staf (ADMIN & DEVELOPER) ---");
  console.log(
    "1. Alfian Gading Saputra : gading@gmail.com / password (0895363116378)"
  );
  console.log(
    "2. Dery Wahyu Perdana    : dery@gmail.com / password (082377341268)"
  );
  console.log(
    "3. Rafli Maulana         : rafli@gmail.com / password (085367271303)"
  );
  console.log("\n--- Akun Klien (CLIENT) ---");
  console.log(
    "1. Gading                : gading-client@gmail.com / password (0895363116378)"
  );
  console.log(
    "2. Dery                  : dery-client@gmail.com / password (082377341268)"
  );
  console.log(
    "3. Rafli                 : rafli-client@gmail.com / password (085367271303)"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
