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
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@aldera.tech";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "password";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Aldera Admin",
      roles: ["ADMIN"],
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: "Aldera Admin",
      roles: ["ADMIN"],
      password: hashedAdminPassword,
      isActive: true,
      emailVerified: new Date(),
    },
  });

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
    update: {
      brandName: defaultSiteSettings.brandName,
      footerDescription: defaultSiteSettings.footerDescription,
      email: defaultSiteSettings.email || "hello@aldera.tech",
      phone: "+62 21 5150888",
      whatsapp: "081288880000",
      address:
        "Treasury Tower Lt. 18, District 8 SCBD, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190",
      mapsUrl: "https://maps.google.com/?q=District+8+SCBD+Jakarta",
      operatingHours: "Senin - Jumat, 09:00 - 18:00 WIB",
      responseTime: "< 2 jam",
      githubUrl: "https://github.com/aldera-tech",
      linkedinUrl: "https://linkedin.com/company/aldera-tech",
      instagramUrl: "https://instagram.com/aldera.tech",
      twitterUrl: "https://x.com/alderatech",
      youtubeUrl: "https://youtube.com/@alderatech",
      tiktokUrl: "https://tiktok.com/@alderatech",
      facebookUrl: "https://facebook.com/alderatech",
      discordUrl: "https://discord.gg/alderatech",
      seoTitle: defaultSiteSettings.seoTitle,
      seoDescription: defaultSiteSettings.seoDescription,
    },
    create: {
      id: SITE_SETTING_ID,
      brandName: defaultSiteSettings.brandName,
      footerDescription: defaultSiteSettings.footerDescription,
      email: defaultSiteSettings.email || "hello@aldera.tech",
      phone: "+62 21 5150888",
      whatsapp: "081288880000",
      address:
        "Treasury Tower Lt. 18, District 8 SCBD, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190",
      mapsUrl: "https://maps.google.com/?q=District+8+SCBD+Jakarta",
      operatingHours: "Senin - Jumat, 09:00 - 18:00 WIB",
      responseTime: "< 2 jam",
      githubUrl: "https://github.com/aldera-tech",
      linkedinUrl: "https://linkedin.com/company/aldera-tech",
      instagramUrl: "https://instagram.com/aldera.tech",
      twitterUrl: "https://x.com/alderatech",
      youtubeUrl: "https://youtube.com/@alderatech",
      tiktokUrl: "https://tiktok.com/@alderatech",
      facebookUrl: "https://facebook.com/alderatech",
      discordUrl: "https://discord.gg/alderatech",
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

  // ----------------------------------------------------------------
  // Tech Tools (Categorized by Frontend, Backend, Mobile, Cloud & DevOps, UI/UX, AI/LLM)
  // ----------------------------------------------------------------
  await prisma.techTool.deleteMany();
  await prisma.techTool.createMany({
    data: [
      // Frontend
      { name: "Next.js", category: "Frontend", icon: "Globe", order: 1, active: true },
      { name: "React", category: "Frontend", icon: "Code2", order: 2, active: true },
      { name: "TypeScript", category: "Frontend", icon: "FileCode", order: 3, active: true },
      { name: "Tailwind CSS", category: "Frontend", icon: "Palette", order: 4, active: true },
      { name: "Vue.js", category: "Frontend", icon: "Layers", order: 5, active: true },

      // Backend
      { name: "Node.js", category: "Backend", icon: "Server", order: 1, active: true },
      { name: "Go", category: "Backend", icon: "Cpu", order: 2, active: true },
      { name: "Python", category: "Backend", icon: "Terminal", order: 3, active: true },
      { name: "PostgreSQL", category: "Backend", icon: "Database", order: 4, active: true },
      { name: "Redis", category: "Backend", icon: "Zap", order: 5, active: true },
      { name: "Prisma", category: "Backend", icon: "Layers", order: 6, active: true },

      // Mobile
      { name: "React Native", category: "Mobile", icon: "Smartphone", order: 1, active: true },
      { name: "Flutter", category: "Mobile", icon: "Smartphone", order: 2, active: true },
      { name: "Swift (iOS)", category: "Mobile", icon: "Smartphone", order: 3, active: true },
      { name: "Kotlin (Android)", category: "Mobile", icon: "Smartphone", order: 4, active: true },

      // Cloud & DevOps
      { name: "Docker", category: "Cloud & DevOps", icon: "Box", order: 1, active: true },
      { name: "Kubernetes", category: "Cloud & DevOps", icon: "Boxes", order: 2, active: true },
      { name: "AWS", category: "Cloud & DevOps", icon: "Cloud", order: 3, active: true },
      { name: "Cloudflare", category: "Cloud & DevOps", icon: "Shield", order: 4, active: true },
      { name: "GitHub Actions", category: "Cloud & DevOps", icon: "GitBranch", order: 5, active: true },

      // UI/UX
      { name: "Figma", category: "UI/UX", icon: "Palette", order: 1, active: true },
      { name: "Framer", category: "UI/UX", icon: "Layout", order: 2, active: true },
      { name: "Storybook", category: "UI/UX", icon: "BookOpen", order: 3, active: true },

      // AI/LLM
      { name: "OpenAI", category: "AI/LLM", icon: "BrainCircuit", order: 1, active: true },
      { name: "Anthropic", category: "AI/LLM", icon: "Sparkles", order: 2, active: true },
      { name: "DeepSeek", category: "AI/LLM", icon: "Zap", order: 3, active: true },
      { name: "LangChain", category: "AI/LLM", icon: "Layers", order: 4, active: true },
      { name: "Hugging Face", category: "AI/LLM", icon: "Cpu", order: 5, active: true },
    ],
  });
  console.log("✔ Tech tools seeded");

  // ----------------------------------------------------------------
  // Engineering Services (6 Core Services)
  // ----------------------------------------------------------------
  await prisma.service.deleteMany();
  await prisma.service.createMany({
    data: [
      {
        slug: "web-application-engineering",
        title: "Web Application Engineering",
        icon: "Code2",
        summary: "Pengembangan web application skala enterprise yang performan, aman, dan siap scale.",
        description:
          "Mulai dari SaaS modern, portal korporat, hingga platform interaktif berlatensi rendah. Dibangun dengan Next.js, React, TypeScript, dan arsitektur microservices atau serverless yang scalable.",
        deliverables: [
          "Arsitektur frontend performa tinggi (Next.js / TypeScript)",
          "Core Web Vitals hijau & optimasi SEO teknis mendalam",
          "REST & GraphQL API terstandarisasi, aman, dan terdokumentasi",
          "Desain responsif lintas perangkat dan browser modern",
          "Automated CI/CD pipeline dan containerization Docker",
        ],
        order: 1,
        active: true,
      },
      {
        slug: "mobile-app-development",
        title: "Mobile App Development",
        icon: "Smartphone",
        summary: "Aplikasi mobile iOS & Android berperforma native dengan siklus rilis gesit.",
        description:
          "Solusi mobile komprehensif menggunakan React Native dan Flutter. Menghadirkan performa mulus, integrasi hardware (kamera, bluetooth, GPS), serta offline-first synchronization.",
        deliverables: [
          "Aplikasi iOS dan Android dari basis kode yang teruji dan efisien",
          "Offline-first architecture & sinkronisasi data background andal",
          "Integrasi push notification, payment gateway, & autentikasi biometrik",
          "Publikasi & kepatuhan rilis App Store dan Google Play Store",
          "Crash analytics, logging terdistribusi, dan pemantauan performa",
        ],
        order: 2,
        active: true,
      },
      {
        slug: "enterprise-cloud-devops",
        title: "Enterprise Cloud & DevOps",
        icon: "Cloud",
        summary: "Infrastruktur cloud berstandar tinggi, otomatisasi deployment, dan ketahanan sistem 99.9%.",
        description:
          "Perancangan arsitektur multi-cloud di AWS, GCP, atau Bare-Metal dengan prinsip Infrastructure as Code (Terraform), Kubernetes cluster orchestration, dan observabilitas menyeluruh.",
        deliverables: [
          "Infrastructure as Code menggunakan Terraform & Ansible",
          "Kubernetes container orchestration & auto-scaling cerdas",
          "Continuous Integration / Continuous Deployment (CI/CD) pipelines",
          "Monitoring 24/7, alert tracing, dan automated backup berkala",
          "Security hardening, audit kepatuhan, dan strategi disaster recovery",
        ],
        order: 3,
        active: true,
      },
      {
        slug: "ai-machine-learning-solutions",
        title: "AI & Machine Learning Solutions",
        icon: "BrainCircuit",
        summary: "Integrasi LLM aggregator, autonomous agents, dan pipeline machine learning terapan.",
        description:
          "Mengembangkan kapabilitas AI generatif ke dalam alur kerja bisnis: enterprise RAG (Retrieval-Augmented Generation), fine-tuned domain models, AI API relays berkinerja tinggi, dan bot cerdas multi-channel.",
        deliverables: [
          "Integrasi multi-LLM (OpenAI, Anthropic Claude, DeepSeek, Local Models)",
          "Retrieval-Augmented Generation (RAG) dengan vector database",
          "High-throughput AI Relay Proxy dengan balance & quota ledger transparan",
          "Omnichannel conversational bots (Telegram, WhatsApp, Web Playground)",
          "Evaluasi akurasi prompt, guardrails mitigasi halusinasi, & audit logs",
        ],
        order: 4,
        active: true,
      },
      {
        slug: "ui-ux-product-design",
        title: "UI/UX & Product Design",
        icon: "Palette",
        summary: "Riset pengguna, prototipe interaktif, dan design system yang berorientasi konversi bisnis.",
        description:
          "Merancang antarmuka produk digital intuitif yang menyatukan estetika modern dan kemudahan navigasi. Kami membangun design system lengkap di Figma yang siap diterjemahkan ke komponen kode.",
        deliverables: [
          "User journey mapping, wireframing, & interactive high-fidelity prototyping",
          "Comprehensive design system & UI component library terstandar",
          "Usability testing dan feedback validation dengan calon pengguna nyata",
          "Spesifikasi design handoff lengkap untuk kemudahan tim engineering",
          "Audit aksesibilitas (WCAG 2.1) & responsivitas layar menyeluruh",
        ],
        order: 5,
        active: true,
      },
      {
        slug: "maintenance-quality-engineering",
        title: "Maintenance & Quality Engineering",
        icon: "ShieldCheck",
        summary: "Audit kode, pemeliharaan berkelanjutan, pengujian otomatis, dan mitigasi downtime.",
        description:
          "Menjaga stabilitas dan keamanan aplikasi produksi dengan uji regresi berkala, automated unit & E2E testing, patching celah keamanan, optimasi query database, dan SLA tanggap cepat.",
        deliverables: [
          "Automated test coverage komprehensif (Unit, Integration, dan E2E)",
          "Audit keamanan berkala & dependency vulnerability patching",
          "Optimasi performa query database & indexing PostgreSQL mendalam",
          "Pemeliharaan server berkala dengan jaminan Service Level Agreement (SLA)",
          "Laporan kesehatan sistem berkala dan rekomendasi roadmap teknologi",
        ],
        order: 6,
        active: true,
      },
    ],
  });
  console.log("✔ Services seeded");

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
        "<h2>Website sebagai Aset Bisnis</h2><p>Di era digital, kehadiran online bukan lagi opsional. Pelanggan mencari informasi, membandingkan harga, dan mengambil keputusan pembelian, semuanya online.</p><p>Website modern bukan sekedar tampil cantik. Ia perlu <strong>cepat</strong>, <strong>mobile-friendly</strong>, dan <strong>SEO-optimized</strong> agar ditemukan oleh audiens yang tepat.</p><h3>Manfaat Konkret</h3><ul><li>Meningkatkan kredibilitas brand.</li><li>Menghasilkan leads otomatis.</li><li>Mengurangi beban customer service.</li></ul><p>Aldera Tech membantu bisnis Indonesia membangun website yang bukan sekedar ada, tapi <em>bekerja</em>.</p>",
      categoryId: catBiz.id,
      featuredImage: "/images/blog/modern-website-strategy.webp",
      published: true,
    },
    {
      slug: "next-js-16-apa-yang-baru",
      title: "Next.js 16: Apa yang Baru dan Kenapa Penting?",
      excerpt:
        "Turbopack default, async request APIs, dan proxy menggantikan middleware. Inilah yang perlu Anda tahu.",
      content:
        "<h2>Turbopack Stable</h2><p>Di Next.js 16, Turbopack telah menjadi bundler default yang menghadirkan kompilasi instan dan Hot Module Replacement yang jauh lebih responsif.</p><h2>Async Request APIs & React 19</h2><p>Semua request API seperti <code>cookies()</code>, <code>headers()</code>, dan dynamic route params kini sepenuhnya asinkron (Promises), terintegrasi mulus dengan fitur React 19 Server Actions.</p><h2>Proteksi Route Terstandarisasi</h2><p>Proteksi rute sensitif diimplementasikan melalui <code>middleware.ts</code> standar untuk mengamankan area dashboard, admin, dan endpoint API secara konsisten.</p>",
      categoryId: catDev.id,
      featuredImage: "/images/blog/nextjs-16-development.webp",
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
      featuredImage: "/images/blog/micro-interactions-ux.webp",
      published: true,
    },
  ];

  for (const post of blogSeeds) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
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
        clientRole: "CEO, PT Finansial Nusantara",
        content:
          "Aldera Tech benar-benar mengerti visi bisnis kami. Dashboard dan arsitektur AI Relay yang mereka rancang memangkas latensi sistem hingga 40% dan membuat kontrol anggaran API menjadi sangat transparan.",
        rating: 5,
        published: true,
        order: 1,
      },
      {
        clientName: "Linda Kusuma",
        clientRole: "Head of Product, RetailGo",
        content:
          "Tim yang sangat profesional, responsif, dan terorganisir. Dari fase discovery hingga launching mobile app di App Store & Play Store, semuanya on time dan on budget.",
        rating: 5,
        published: true,
        order: 2,
      },
      {
        clientName: "Ridho Pratama",
        clientRole: "VP of Engineering, Logistics Pro",
        content:
          "Kualitas arsitektur cloud dan pipeline CI/CD yang dibangun Aldera Tech sangat solid. Downtime sistem kami terpangkas drastis dan skalabilitas traffic peak season aman terkendali.",
        rating: 5,
        published: true,
        order: 3,
      },
      {
        clientName: "Maya Lestari",
        clientRole: "Marketing Director, Kopi Kita",
        content:
          "Mereka bukan sekadar ngoding, melainkan partner strategis. Storefront baru kami meningkatkan conversion rate hingga 2.5x lipat dalam kurun waktu tiga bulan pertama.",
        rating: 5,
        published: true,
        order: 4,
      },
      {
        clientName: "Bambang Sudiro",
        clientRole: "CTO, Medika Digital Solusi",
        content:
          "Implementasi sistem keamanan data pasien dan audit trail sesuai standar kepatuhan regulasi diselesaikan dengan cermat dan tepat waktu. Kerja sama yang luar biasa.",
        rating: 5,
        published: true,
        order: 5,
      },
      {
        clientName: "Jessica Tan",
        clientRole: "Founder, EduKits EdTech",
        content:
          "Design system di Figma sangat konsisten dan langsung match dengan kode komponen frontend. Sangat mempercepat tim internal kami saat merilis modul pembelajaran baru.",
        rating: 5,
        published: true,
        order: 6,
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
      title: "TechNova: Platform B2B Enterprise Multi-Tenant & Billing Relay",
      client: "TechNova Enterprise",
      industry: "B2B SaaS & Cloud",
      summary:
        "Membangun platform B2B lengkap dengan AI relay proxy yang menaikkan konversi enterprise lead hingga 300%.",
      challenge:
        "TechNova mengalami bottleneck pada proses sales enterprise dan biaya konsumsi LLM yang tidak terkontrol karena model pricing yang kaku.",
      solution:
        "Aldera Tech merancang arsitektur web platform terintegrasi dengan AI Relay router, kuota ledger berkecepatan tinggi, serta sistem billing multi-tenant otomatis.",
      result:
        "Konversi lead ke deal naik 300%. Onboarding turun dari 14 hari menjadi 2 hari. Penghematan biaya operasional AI mencapai 38%.",
      featuredImage: "/images/portfolio/technova-b2b-platform.webp",
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
      published: true,
      order: 1,
    },
    {
      slug: "kopi-kita-ecommerce",
      title: "Kopi Kita: E-Commerce Omnichannel dengan Payment Gateway Terpadu",
      client: "Kopi Kita Group",
      industry: "F&B Retail & E-Commerce",
      summary:
        "Storefront modern dengan integrasi pembayaran Midtrans, kalkulator ongkir dinamis, dan sistem loyalty pelanggan.",
      challenge:
        "Hanya mengandalkan marketplace pihak ketiga yang memakan margin komisi tinggi dan hilangnya data kepemilikan konsumen langsung.",
      solution:
        "Membangun storefront D2C independen berkecepatan tinggi dengan auto-checkout QRIS, WhatsApp order notification, dan inventory sync.",
      result:
        "Penjualan direct channel melonjak 200% dalam 90 hari, repeat order mencapai 42%, dan margin laba bersih meningkat 22%.",
      featuredImage: "/images/portfolio/kopi-kita-ecommerce.webp",
      techStack: ["Next.js", "Prisma", "PostgreSQL", "Midtrans", "Fonnte"],
      published: true,
      order: 2,
    },
    {
      slug: "finsmart-mobile-app",
      title: "FinSmart: Aplikasi Personal Finance & Wealth Tracker 100K+ Pengguna",
      client: "FinSmart Asia",
      industry: "FinTech & Wealth Management",
      summary:
        "Aplikasi mobile iOS & Android dengan visualisasi keuangan interaktif dan keamanan standar perbankan.",
      challenge:
        "Aplikasi versi sebelumnya lambat, sering crash pada perangkat low-end, dan memiliki tingkat retensi pengguna 30 hari yang rendah.",
      solution:
        "Refactoring penuh menggunakan React Native dengan engine Hermes, enkripsi data lokal tingkat lanjut, dan UX micro-interactions intuitif.",
      result:
        "100.000+ unduhan organik, crash-free session 99.8%, rating 4.8 di App Store & Play Store, dan waktu muat berkurang 65%.",
      featuredImage: "/images/portfolio/finsmart-mobile-app.webp",
      techStack: ["React Native", "TypeScript", "Node.js", "Redis", "Framer Motion"],
      published: true,
      order: 3,
    },
    {
      slug: "medikare-cloud-hospital",
      title: "Medikare: Sistem Informasi Rumah Sakit & Telekonsultasi Terintegrasi",
      client: "Medikare Hospital Network",
      industry: "Healthcare & MedTech",
      summary:
        "Infrastruktur cloud terdistribusi untuk rekam medis elektronik (RME) dan telekonsultasi dokter berkeamanan tinggi.",
      challenge:
        "Sistem legacy sering downtime saat jam sibuk dan belum terhubung ke sistem SatuSehat Kementerian Kesehatan.",
      solution:
        "Implementasi arsitektur cloud mikro di AWS, interoperabilitas FHIR / SatuSehat API, serta modul reservasi online berkecepatan tinggi.",
      result:
        "Waktu tunggu pasien di klinik berkurang 50%, uptime sistem mencapai 99.98%, dan sertifikasi kepatuhan data kesehatan lulus 100%.",
      featuredImage: "/images/portfolio/medikare-hospital.webp",
      techStack: ["Next.js", "Go", "PostgreSQL", "AWS ECS", "Kubernetes"],
      published: true,
      order: 4,
    },
  ];

  await prisma.caseStudy.deleteMany();
  for (const cs of caseStudies) {
    await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: cs,
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
    update: {
      featureDisclaimer:
        'Satu input = satu fitur spesifik.\n[BENAR] Contoh: "Login dengan Google"\n[SALAH] Contoh: "Sistem login lengkap dengan social media, 2FA, dan forgot password"\n\nJika fitur terlalu besar, tim kami akan memecahnya saat review.',
      revisionPolicy:
        "• Bug dari Aldera Tech = revisi gratis tanpa batas\n• Revisi dari Anda = 2x gratis (1 revisi = 1 fitur)\n• Revisi tambahan = Rp 300.000/fitur\n• Contoh: Jika Anda ingin merevisi 3 fitur sekaligus, itu menggunakan 3 jatah revisi.",
    },
    create: {
      featureDisclaimer:
        'Satu input = satu fitur spesifik.\n[BENAR] Contoh: "Login dengan Google"\n[SALAH] Contoh: "Sistem login lengkap dengan social media, 2FA, dan forgot password"\n\nJika fitur terlalu besar, tim kami akan memecahnya saat review.',
      revisionPolicy:
        "• Bug dari Aldera Tech = revisi gratis tanpa batas\n• Revisi dari Anda = 2x gratis (1 revisi = 1 fitur)\n• Revisi tambahan = Rp 300.000/fitur\n• Contoh: Jika Anda ingin merevisi 3 fitur sekaligus, itu menggunakan 3 jatah revisi.",
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
      name: "Web App & SaaS",
      slug: "web-app",
      description: "Platform SaaS, web application kustom, dashboard analytics, dan portal korporat interaktif",
      basePrice: 12000000,
      icon: "code2",
      dependentFields: [
        {
          label: "Jumlah Modul / Halaman Utama",
          type: "number",
          pricePerUnit: 750000,
          unit: "modul",
          min: 1,
          max: 50,
        },
      ],
      order: 0,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "Mobile App iOS / Android",
      slug: "mobile-app",
      description: "Aplikasi mobile cross-platform (React Native / Flutter) siap rilis di Play Store & App Store",
      basePrice: 15000000,
      icon: "smartphone",
      dependentFields: [
        {
          label: "Jumlah Layar / Screen Utama",
          type: "number",
          pricePerUnit: 800000,
          unit: "layar",
          min: 1,
          max: 40,
        },
      ],
      order: 1,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "E-Commerce Platform",
      slug: "ecommerce",
      description: "Toko online kustom, payment gateway Midtrans, sistem katalog, manajemen inventori, dan logistik kurir",
      basePrice: 18000000,
      icon: "shoppingBag",
      dependentFields: [
        {
          label: "Jumlah Fitur Transaksi Khusus",
          type: "number",
          pricePerUnit: 1000000,
          unit: "fitur",
          min: 1,
          max: 20,
        },
      ],
      order: 2,
    },
  });

  await prisma.projectType.create({
    data: {
      name: "Custom Enterprise Solution",
      slug: "custom-enterprise",
      description: "Sistem arsitektur enterprise kustom, AI integration, otomasi workflow bisnis, dan integrasi API legacy",
      basePrice: 25000000,
      icon: "layers",
      dependentFields: [
        {
          label: "Jumlah Integrasi Sub-sistem",
          type: "number",
          pricePerUnit: 1500000,
          unit: "integrasi",
          min: 1,
          max: 15,
        },
      ],
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
      disclaimer: "Termasuk Midtrans. Gateway lain mungkin berbeda harga.",
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
  console.log(`0. Aldera Admin          : ${adminEmail} / ${adminPassword}`);
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
