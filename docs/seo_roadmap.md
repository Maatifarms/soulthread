# SoulThread SEO & Discoverability Roadmap

To fulfill the objective of making SoulThread the top destination for mental wellness searches, we have implemented a **Continuous SEO Strategy**. This isn't a one-time setup, but an active system.

**LATEST DEPLOYMENT: Phase 4 Brand Authority is now LIVE.**

## Phase 1: Foundation (Completed)
- [x] **Dynamic Meta Tags**: `SEO.jsx` component that updates title, desc, and OG tags per page.
- [x] **JSON-LD Schema**: Integrated Organization, and Sitelinks Searchbox structured data.
- [x] **Open Graph Support**: Optimized sharing for Twitter/X and WhatsApp.
- [x] **Favicon & Identity**: Brand assets correctly linked for "brand search" recognition.

## Phase 2: Content Growth (Completed)
- [x] **Course Schema**: Applied to all learning series (Hyperfocus, Never Finished, etc.) to dominate educational search.
- [x] **Visible Breadcrumbs**: Implemented navigation links for users and crawlers across major routes.
- [x] **Hierarchical Schema**: Automated `BreadcrumbList` JSON-LD for site structure.
- [x] **FAQ Schema**: Added to Support pages to capture "How to" search queries.
- [x] **Automated Sitemap**: Created `generate-sitemap.cjs` integrated into the build process.

## ✅ Phase 3: Content Silos & Performance (Completed)
- [x] **Internal Linking Strategy**: 
    - Added cross-series recommendations (CTAs) at the end of each learning series.
    - Integrated core series links into the Home Page Hero section for better crawling.
- [x] **Image SEO Phase 1**: 
    - Implemented `loading="lazy"` and `decoding="async"` across the feed and series.
    - Added dynamic descriptive `alt` tags using content snippets for user-generated media.
- [x] **Core Web Vitals**:
    - Optimized font loading with preloading and modern `woff2` formats.
    - Implemented `fetchpriority="high"` for critical LCP elements like the site logo.
- [x] **Premium 404 Experience**: 
    - Created a custom, SEO-friendly 404 page with navigation recovery links.
    - Correctly configured catch-all routing to prevent empty responses.

## ✅ Phase 4: Brand Authority & Experience (Active)
- [x] **Brand Story (About Page)**: Created `About.jsx` to define the mission and establish E-E-A-T.
- [x] **Robots.txt Control**: Added `robots.txt` to guide search engine crawlers and protect auth/private pages.
- [x] **Link Distribution**: Integrated "About" and "Series" into Navbar and Sitemap.
- [x] **Enhanced Organization Schema**: Added founding date, sameAs links, and contact points to Google's Knowledge Graph.
- [x] **Keyword Density**: Optimized `HeroSection` and `Home` page with high-intent wellness keywords.

## ✅ Phase 5: Hyper-Growth & Dynamic Indexing (Completed)
- [x] **Dynamic Sitemap**: Integrated Firestore post slugs (300+ real stories) into the sitemap.
- [x] **Rich Snippets Monitoring**: Verified schema.org detections for Learning Series (ItemList/Course).
- [x] **Performance Optimization**: Added Preconnect/DNS-prefetch for Google & Firebase services.
- [x] **LCP Enhancement**: Optimized Hero section and logo loading speeds.

## ✅ Phase 6: Advanced Analytics & Retention (Completed)
- [x] **GA4 Enhanced Tracking**: Full Google Analytics 4 integration with custom event tracking.
- [x] **Retention Hooks**: Implemented "🔥 Day Streak" tracking on the Home feed.
- [x] **Series Progress Tracking**: Added visual progress bars to indicate Library completion rates.
- [x] **Dual-Track Analytics**: Unified client-side (GA4) and server-side (Firestore) event logging.

## 🚀 Phase 7: Community Trust & Real-time Engagement (In Progress)
- [x] **Global Reflection Wall**: Real-time anonymous sharing workspace.
- [x] **Community Spotlight**: Highlighting exceptional peer support stories.
- [x] **Moderation Tools**: Integrated "Report" functionality for community safety.
- [ ] **Real-time Notifications**: Notify users of engagement milestones.
- [ ] **Trust Badges**: Visual indicators for verified psychologists and helpful peers.

## Daily SEO Maintenance
1. **URL Consistency**: Always share `https://soulthread.in/...` (never the firebaseapp.com subdomain).
2. **Indexing**: After publishing a major new series, use Google Search Console to "Request Indexing".
3. **Internal Linking**: Link to "Hyperfocus" or "Mental Toughness" series in group discussions to build internal authority.

---

> [!TIP]
> **SEO Pro-Tip**:
> The `sitemap.xml` is now automatically generated before every build. You don't need to update it manually. Just run `npm run build` or the `/deploy` workflow, and your sitemap will refresh with the latest dates and routes!
