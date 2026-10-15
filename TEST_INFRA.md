# E2E Test Infra: Aldera Tech Platform Dynamization & Standardization

## Test Philosophy
- **Requirement-Driven & Opaque-Box**: Tests are derived directly from the authoritative specifications in `ORIGINAL_REQUEST.md` (section `## 2026-10-15T12:40:59Z`) and `PROJECT.md`.
- **Progressive Testability**: Tests verify modular interface contracts, database models, validators, and business logic progressively across development milestones.
- **Methodology**: Systematic 4-Tier test suite:
  - **Tier 1 (Feature Coverage)**: Happy path isolating each requirement (F1 to F20) with at least 5 distinct test cases per feature.
  - **Tier 2 (Boundary & Corner Cases)**: Edge conditions, invalid inputs, cooldown timers, brute-force lockout, zero/negative pricing, and length constraints (at least 5 tests per feature).
  - **Tier 3 (Cross-Feature Interactions)**: State transitions and multi-subsystem workflows (e.g. registration -> OTP verify -> login -> in-dashboard calculator -> orders; admin testimonial publish toggle -> dynamic public showcase).
  - **Tier 4 (Real-World Scenarios)**: Authentic end-to-end user journeys mirroring the Indonesian software agency ecosystem.

---

## Feature Inventory (F1 to F20)
| # | Feature | Description | Source | Tier 1 (>=5) | Tier 2 (>=5) | Tier 3 (Cross) | Tier 4 (Real-World) |
|---|---------|-------------|--------|:------------:|:------------:|:--------------:|:-------------------:|
| F1 | Strict Role Constraint | Keep Prisma `Role` enum strictly as `ADMIN`, `DEVELOPER`, `CLIENT` | ORIGINAL_REQUEST §Core Constraints | 5 | 5 | ✓ | ✓ |
| F2 | Schema Extension (`TechTool`, `Service`, `SiteSetting`) | Define `TechTool`, `Service`, and 5 social media fields on `SiteSetting` | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F3 | Realistic Database Seeder (`prisma/seed.ts`) | Seed realistic Indonesian agency data (Jakarta office, WhatsApp, 8 social URLs, B2B project types, 6 service tracks) | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| F4 | Price History Invariance Guarantee | Verify `OrderRequest`, `Proposal`, and `Invoice` maintain static snapshot pricing immune to catalog changes | ORIGINAL_REQUEST §Core Constraints | 5 | 5 | ✓ | ✓ |
| F5 | Dynamic Public Home & Services Showcase | Home service section and `/services` render dynamically from `Service` model with deliverables | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F6 | Dynamic Tech Stack Showcase | `/about` section "Alat yang kami kuasai" renders dynamically from `TechTool` categorized by stack | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F7 | Dynamic 8-Platform Footer | Footer renders all 8 social platforms dynamically from `SiteSetting`, hiding null/empty links, with custom SVGs | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| F8 | WhatsApp OTP Registration Flow | Mandatory WhatsApp phone at `/register`, 6-digit numeric OTP in `VerificationToken`, Fonnte dispatch | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| F9 | OTP Verification Interface (`/verify-otp`) | Verification page/modal, rate limiting (<5 attempts, 60s resend cooldown), timestamping `phoneVerified`, auto-login | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| F10 | Admin Testimonials Route & Page (`/admin/testimonials`) | Implement `app/admin/testimonials/page.tsx` and coordinator component to resolve 404 | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| F11 | Admin Testimonials CRUD & Modals | Full CRUD with star ratings (1-5), publish toggle, and custom `AlertDialog` confirmation without native confirm | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| F12 | Admin Navigation Audit | Verify all sidebar links in `lib/dashboard-nav.ts` resolve properly with zero 404s | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| F13 | Shared Calculator Engine (`lib/calculator.ts`) | Reusable calculator math engine with base price, discount, urgency, add-ons, and itemized breakdown | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| F14 | In-Dashboard Calculator (`/dashboard/calculator`) | Embed `CalculatorWizard` directly inside dashboard layout for authenticated clients without external redirect | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| F15 | Dashboard Orders Integration | Point "Estimasi Baru" in `/dashboard/orders` to `DASHBOARD_ROUTES.calculator` | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| F16 | Native Dialog Replacement | Replace all `confirm()` calls with `ConfirmDialog` and `alert()` with `toast.error()` | ORIGINAL_REQUEST §R6, §Core Constraints | 5 | 5 | ✓ | ✓ |
| F17 | Cursor Pointer Standardization | Add `cursor-pointer` to `buttonVariants`, Radix triggers (`accordion`, `tabs`, `select`, `checkbox`, `dropdown-menu`), and `globals.css` | ORIGINAL_REQUEST §R6 | 5 | 5 | ✓ | ✓ |
| F18 | Skeleton Loading UI | Implement route-level and component-level skeletons for async states (`/dashboard/orders`, `/admin/testimonials`) | ORIGINAL_REQUEST §R6 | 5 | 5 | ✓ | ✓ |
| F19 | Indonesian Language & Duration Standardization | Replace "h" duration with "jam"/"j", clean mixed sidebar terms in `lib/dashboard-nav.ts`, standardize order statuses | ORIGINAL_REQUEST §R6 | 5 | 5 | ✓ | ✓ |
| F20 | AI Documentation Guidelines | Create `docs/ai-guidelines.md` documenting UI/UX rules, modals, and conventions; update `CLAUDE.md` and `PROJECT.md` | ORIGINAL_REQUEST §R6 | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- **Test Runner**: Bun test runner (`bun test tests/e2e`)
- **Automated Script Runner**: `tests/e2e/run_all.sh`
- **Test Suites Structure**:
  - `tests/e2e/helpers/contracts.ts`: Authoritative domain models, contracts, validators, calculator math, OTP rate limiter, and AST scanners.
  - `tests/e2e/tier1_features.test.ts`: Feature coverage (happy-path isolation, >=5 tests per feature for F1 to F20 = 100 tests).
  - `tests/e2e/tier2_boundaries.test.ts`: Boundary values, limits, cooldowns, and error handling (>=5 tests per feature for F1 to F20 = 100 tests).
  - `tests/e2e/tier3_combinations.test.ts`: Multi-feature cross-interactions and state machine transitions (16 tests).
  - `tests/e2e/tier4_realworld.test.ts`: End-to-end Indonesian software agency user journeys (6 comprehensive scenarios).

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Complete Indonesian Agency Customer Journey (Home -> Services -> WhatsApp Register -> Verify OTP -> In-Dashboard Calculator -> Orders) | F5, F8, F9, F13, F14, F15 | High |
| 2 | Agency Admin Testimonial Lifecycle & Public Showcase Synchronization | F5, F10, F11, F16 | Medium |
| 3 | B2B Pricing Catalog Update & Historical Order Immutability Audit | F4, F13, F14, F15 | High |
| 4 | WhatsApp OTP Security, Brute-Force Defense & Cooldown Rate Limiting | F8, F9 | Medium |
| 5 | Multi-Platform Agency Contact & Omnichannel Social Presence (8 platforms) | F2, F7, F3 | Medium |
| 6 | UI/UX Quality, Accessibility & Indonesian Language Consistency Audit | F16, F17, F18, F19, F20 | High |

---

## Coverage Thresholds & Target Counts
- **Tier 1 (Feature Isolation)**: 20 features × 5 tests = **100 tests**
- **Tier 2 (Boundary & Corner Cases)**: 20 features × 5 tests = **100 tests**
- **Tier 3 (Cross-Feature Combinations)**: **16 tests**
- **Tier 4 (Real-World Workflows)**: **6 scenarios**
- **Total Minimum Target**: **222 test cases**
