# PROJECT.md — AR-DECKDROP

## Overview
**AR-DECKDROP** is an e-commerce platform for trading card game (TCG) products — Yu-Gi-Oh, Pokémon TCG, and One Piece TCG — serving customers in Europe. The store sells in-stock products for immediate purchase and supports pre-orders for upcoming releases, with shipping fulfilled once pre-ordered items become available.

## Target Market
- Region: Europe (single currency/region assumption for v1 — confirm EUR as base currency)
- VAT handling required for EU sales

## Core Features (v1)

### Customer-Facing
- **Product catalog**
  - Multiple games supported: Yu-Gi-Oh, Pokémon TCG, One Piece TCG
  - Sealed products (booster boxes, packs, structure decks)
  - Singles (individual cards — with rarity/condition/set variants)
  - Accessories (sleeves, playmats, deck boxes, etc.)
  - Browsing by game, then category and set within that game
  - Search and filtering (by game, set, rarity, price, availability)
- **Pre-orders**
  - Products can be marked as "pre-order" with an expected release date
  - Customers can purchase pre-order items same as in-stock items
  - Clear UI distinction between in-stock and pre-order items
  - Pre-order items ship only once stock arrives (see Order Fulfillment below)
- **Accounts**
  - Email/password signup, login, password reset
  - View order history (including pending pre-orders)
  - Manage shipping addresses
- **Cart & Checkout**
  - Cart supports mixed orders (in-stock + pre-order items together — see Order Splitting below)
  - Checkout with shipping address, order summary
  - Payment via Stripe or PayPal
- **Shipping**
  - EU shipping only for v1
  - Shipping cost calculation (flat rate or weight-based — TBD)
  - Order status tracking (placed, paid, awaiting stock, shipped, delivered)

### Admin-Facing (essential for v1)
- Product management (create/edit/delete products, set stock levels, mark as pre-order with release date)
- Order management (view all orders, update status, mark as shipped, add tracking number)
- Pre-order management (view which pre-orders are pending per product, trigger fulfillment when stock arrives)
- Basic sales/inventory overview

## Explicitly Out of Scope for v1
- Multi-vendor / marketplace support
- Non-EU shipping
- Multi-language support (single language, likely English, for v1)
- Multi-currency support (single currency, EUR, for v1)
- Loyalty points / rewards program
- Product reviews and ratings
- Wishlist functionality
- Mobile app (web only, responsive design)

## Tech Stack
- **Backend**: Spring Boot 3.x, Java 21
- **Database**: PostgreSQL (Docker locally, managed Postgres in production)
  - Local dev DB is already running via Docker (Postgres 16, container name `shop-postgres`, named volume `shop-postgres-data`)
  - Connection: `localhost:5432`, database `shopdb`
  - `application.properties` should point to this connection for local development (`jdbc:postgresql://localhost:5432/shopdb`)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
  - Admin panel lives in the same Next.js app under a separate `/admin` route group, not a standalone app
  - Component library: shadcn/ui recommended for building forms, tables, and product cards quickly on top of Tailwind
- **Auth**: Spring Security + JWT
- **Payments**: Stripe and PayPal (both integrated)
- **Image/asset storage**: TBD (S3 or Cloudinary recommended)

## Core Data Model (initial draft)

- **User**: id, email, password (hashed), name, role (CUSTOMER/ADMIN), createdAt
- **Address**: id, userId, line1, line2, city, postalCode, country, isDefault
- **Game**: id, name (YU_GI_OH / POKEMON / ONE_PIECE), slug — top-level filter for the whole catalog
- **Product**: id, gameId, name, description, slug, categoryId, basePrice, imageUrls, isPreorder, releaseDate (nullable), stockQuantity, createdAt — shared base for all sealed products and as the parent record for singles
- **Category**: id, gameId, name, slug, parentCategoryId (nullable — for subcategories like "Booster Boxes", "Singles"; categories can be game-specific or shared)

**Singles are modeled as separate per-game variant tables** (rather than one shared `CardVariant`), since rarity, condition, and card-specific attributes differ meaningfully across games:

- **YuGiOhCardVariant**: id, productId, rarity (COMMON/RARE/SUPER_RARE/ULTRA_RARE/SECRET_RARE/etc.), condition (NM/LP/MP/HP/DMG), setCode, cardNumber, stockQuantity, price
- **PokemonCardVariant**: id, productId, rarity, holoType (NON_HOLO/HOLO/REVERSE_HOLO/FULL_ART/ALT_ART), condition (NM/LP/MP/HP/DMG), setCode, cardNumber, stockQuantity, price
- **OnePieceCardVariant**: id, productId, rarity (C/UC/R/SR/SEC/L), cardType (LEADER/CHARACTER/EVENT/STAGE), condition (NM/LP/MP/HP/DMG), setCode, cardNumber, stockQuantity, price

Each variant table links back to a `Product` row (which holds the shared name/description/images/game/category), so cart, order, and catalog logic can mostly work against `Product` generically, while the game-specific detail pages and admin forms query the matching variant table.
- **Cart**: id, userId, createdAt
- **CartItem**: id, cartId, productId, variantType (nullable — YU_GI_OH/POKEMON/ONE_PIECE, only set for singles), variantId (nullable), quantity
- **Order**: id, userId, addressId, status (PENDING_PAYMENT, PAID, AWAITING_STOCK, SHIPPED, DELIVERED, CANCELLED), totalAmount, paymentProvider, paymentReference, createdAt
- **OrderItem**: id, orderId, productId, variantType (nullable), variantId (nullable), quantity, priceAtPurchase, isPreorder, fulfillmentStatus
- **Payment**: id, orderId, provider (STRIPE/PAYPAL), providerTransactionId, amount, status, createdAt

## Key Design Decisions & Open Questions
- **Order splitting**: if a customer orders both in-stock and pre-order items together, do we ship in-stock items immediately and pre-order items later (split shipment), or hold the whole order until everything is available? *(Recommend: split shipment for better customer experience — confirm before building order fulfillment logic.)*
- **Singles complexity**: individual cards typically vary by set, rarity, and condition, each with its own stock and price. Modeled as separate per-game variant tables (`YuGiOhCardVariant`, `PokemonCardVariant`, `OnePieceCardVariant`) rather than one shared table, since rarity/condition attributes differ meaningfully by game — confirm this matches how you want to manage inventory.
- **Tradeoff of separate variant tables**: this keeps each game's data model clean and easy to extend independently, but means cart/order/admin code that touches singles needs to branch on game type (e.g., a polymorphic `variantType` + `variantId` pair on `CartItem`/`OrderItem` rather than a single foreign key). Slightly more boilerplate, but avoids an awkward shared schema as the catalog grows.
- **VAT**: EU VAT rules can get complex (reverse charge for B2B, varying rates by country). For v1, recommend flat VAT-inclusive pricing and revisit proper VAT handling before scaling.
- **Shipping cost**: flat-rate vs. weight/dimension-based — needs a decision before building the shipping calculation logic.

## Design Direction
Visual reference: [luminous.cards](https://www.luminous.cards/) (structure/layout inspiration, not visual styling — it's a B2B wholesale site, ours is B2C).

**Patterns to adopt:**
- **Header**: logo, search bar, account icon, cart icon
- **Primary nav**: game-scoped top-level items (Yu-Gi-Oh, Pokémon TCG, One Piece TCG, Accessories, Pre-orders) — kept flat since we only carry 3 games, unlike the reference site's deep multi-brand mega-menu
- **Hero banner**: promotional/featured content at the top of the homepage
- **Game quick-links**: a row of clickable game filters just below the hero
- **Stacked product carousels**: horizontally-scrollable sections with a header + "View all" link — e.g. "New Arrivals," "Pre-orders," "Back in Stock"
- **Product card badges**: small overlay badges for status — "Pre-order," "New arrival," "Sale %" — plus a visible release date on pre-order cards
- **Brand/game trust strip**: near the footer

**Key difference from the reference site**: Luminous.cards hides prices and requires login to order (B2B wholesale model). Our site is B2C — prices and add-to-cart must be visible to all visitors, with login only required at checkout.

## Frontend Architecture

**Stack**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui

**Folder structure**:
```
frontend/
├── app/
│   ├── (shop)/          # customer-facing routes
│   │   ├── page.tsx          # homepage
│   │   ├── [game]/            # game-scoped catalog (yu-gi-oh, pokemon, one-piece)
│   │   ├── product/[slug]/    # product detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── account/
│   └── admin/            # admin panel, separate route group
│       ├── products/
│       ├── orders/
│       └── preorders/
├── lib/
│   ├── api.ts             # typed API client (generated from openapi.json)
│   └── utils.ts
├── components/            # shared UI components (ProductCard, GameNav, etc.)
├── types/                 # TypeScript types (generated from openapi.json)
└── openapi.json            # snapshot of the backend's OpenAPI spec
```

**Backend integration**: the frontend never guesses the API shape by hand. The Spring Boot backend exposes a live OpenAPI spec via `springdoc-openapi` (`/v3/api-docs`). The workflow is:
1. Pull the latest spec: `curl http://localhost:8080/v3/api-docs -o openapi.json` into the `frontend/` folder
2. Regenerate `types/` and `lib/api.ts` from `openapi.json` whenever a meaningful batch of backend endpoints changes
3. `NEXT_PUBLIC_API_URL` env variable points at the backend (`http://localhost:8080` in dev)

This keeps the frontend's understanding of the API honest and in sync with the real backend, rather than drifting from a hand-written reference doc.

**Frontend conventions**:
- Components: PascalCase filenames matching the component name (`ProductCard.tsx`)
- Server Components by default; `"use client"` only where interactivity is needed (cart, forms, filters)
- Data fetching: Server Components fetch directly via `lib/api.ts`; client-side mutations (add to cart, checkout) go through the same client
- Styling: Tailwind utility classes; shared design tokens (colors, spacing) centralized in `tailwind.config.ts` rather than scattered magic values

## Backend Conventions
- **Package structure**: organize by feature (e.g., `product`, `order`, `user`, `payment`) rather than by layer
- **API layer**: use DTOs for all request/response bodies — never expose JPA entities directly
- **Error handling**: centralized `@ControllerAdvice` global exception handler with consistent error response format
- **Naming**: standard Java conventions (camelCase for methods/variables, PascalCase for classes)
