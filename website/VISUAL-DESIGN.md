# joni.bz Visual Design Overview

## Design Philosophy

Modern, clean, trustworthy design with a purple/blue gradient theme that matches the existing crypto payment system. Professional look suitable for financial transactions while maintaining approachability.

---

## Color Palette

### Primary Colors
- **Primary Purple**: `#667eea` - Used for headings, buttons, accents
- **Deep Purple**: `#764ba2` - Secondary color, gradient end
- **Pink Accent**: `#f093fb` - Highlights, gradient text
- **Dark Text**: `#1a1a2e` - Primary text color
- **Gray**: `#6b7280` - Secondary text, subtle elements

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Used for: Hero section, buttons, headings
- **Secondary Gradient**: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
  - Used for: Accent text, special highlights

### Backgrounds
- **White**: `#ffffff` - Card backgrounds, main content
- **Light Gray**: `#f5f7ff` - Section backgrounds
- **Gray Light**: `#f3f4f6` - Subtle backgrounds, borders

---

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Font Weights
- 300 (Light) - Subtle text
- 400 (Regular) - Body text
- 500 (Medium) - Labels, nav links
- 600 (Semi-bold) - Feature headings
- 700 (Bold) - Section titles
- 800 (Extra-bold) - Hero titles

### Font Sizes
- **Hero Title**: 3.5rem (56px)
- **Section Title**: 2.5rem (40px)
- **Page Title**: 3rem (48px)
- **Feature Title**: 1.25rem (20px)
- **Body Text**: 1rem (16px)
- **Small Text**: 0.875rem (14px)

---

## Page-by-Page Visual Design

### 1. Home Page

#### Navigation Bar
```
┌─────────────────────────────────────────────────────┐
│ 🌐 joni.bz    Home  Search  About  Admin          │
└─────────────────────────────────────────────────────┘
```
- Fixed at top
- White background with subtle shadow
- Active page indicator (underline)

#### Hero Section
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Buy Domains with Crypto        ┌───────────────┐ │
│                                  │ ● Payment     │ │
│  Register your perfect domain   │   Confirmed   │ │
│  instantly using cryptocurrency. │               │ │
│                                  │ example.com   │ │
│  [ETH] [USDC] [SOL] [BTC]       │ 0.05 ETH      │ │
│                                  └───────────────┘ │
│  [Search Domains →]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- Purple/blue gradient background
- White text
- Floating card animation on right
- Grid pattern overlay (subtle)

#### Features Section
```
┌─────────────────────────────────────────────────────┐
│              Why Choose joni.bz?                    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    ⚡     │  │    🔒     │  │    💎     │        │
│  │ Instant  │  │  Secure  │  │Multi-Chain│        │
│  │ Register │  │ & Private│  │  Support  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    🌍     │  │    📊     │  │    💰     │        │
│  │  Global  │  │Real-Time │  │Competitive│        │
│  │  Access  │  │ Tracking │  │  Pricing  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────┘
```
- White background
- 3x2 grid on desktop
- Cards with hover effects (lift up, shadow)
- Icons, title, description in each card

#### How It Works
```
┌─────────────────────────────────────────────────────┐
│                How It Works                         │
│                                                     │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐│
│  │    ①     │  →   │    ②     │  →   │    ③     ││
│  │  Search  │      │  Choose  │      │   Pay &  ││
│  │  Domain  │      │  Crypto  │      │ Register ││
│  └──────────┘      └──────────┘      └──────────┘│
│                                                     │
│            [Get Started Now]                        │
└─────────────────────────────────────────────────────┘
```
- Light gray background
- 3 numbered circles with steps
- Arrows between steps
- CTA button centered below

#### Crypto Support
```
┌─────────────────────────────────────────────────────┐
│         Supported Cryptocurrencies                  │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │  Ξ   │  │  ₿   │  │  ◎   │  │  $   │          │
│  │ ETH  │  │ BTC  │  │ SOL  │  │ USDC │          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────────────────┘
```
- White background
- 4 cards with crypto icons
- Hover effect changes to gradient

---

### 2. Search Page

#### Domain Search Form
```
┌─────────────────────────────────────────────────────┐
│         🌐 Register Your Domain                     │
│         Pay with crypto. Instant registration.      │
│                                                     │
│  Domain Name                                        │
│  ┌────────────────────────────────────────────┐   │
│  │ example.com                                │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  Payment Method                                     │
│  ┌────────────────────────────────────────────┐   │
│  │ Ethereum (ETH)                          ▼  │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  Email (optional)                                   │
│  ┌────────────────────────────────────────────┐   │
│  │ your@email.com                             │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  [Check Availability & Create Order]                │
└─────────────────────────────────────────────────────┘
```
- White card centered
- Clean form inputs with focus states
- Large primary button

#### Payment Screen
```
┌─────────────────────────────────────────────────────┐
│              💰 Payment                             │
│                                                     │
│  Domain: example.com                                │
│  ┌──────────────────────────────────────────┐     │
│  │ Price (USD): $15.99                      │     │
│  │ Price (Crypto): 0.0052 ETH               │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
│              28:45                                  │
│                                                     │
│  Send exactly this amount to:                       │
│  ┌──────────────────────────────────────────┐     │
│  │ 0x742d35Cc6634C0532925a3b844Bc9e7595f0 │     │
│  └──────────────────────────────────────────┘     │
│  [📋 Copy Address]                                 │
│                                                     │
│        [QR CODE]                                    │
│                                                     │
│  ⏳ Waiting for payment...                          │
│                                                     │
│  [🔄 Check Payment Status]                         │
└─────────────────────────────────────────────────────┘
```
- Timer counts down in large font
- QR code displays in center
- Status updates automatically
- Copy button for easy mobile payment

---

### 3. Admin Page

#### Admin Login
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           Admin Login                               │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │ Enter API Key                              │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  [Login]                                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- Modal overlay (dark transparent background)
- White card centered
- Simple password input

#### Admin Dashboard
```
┌─────────────────────────────────────────────────────┐
│         📊 Admin Dashboard                          │
│         Crypto Domain Platform                      │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Total │  │Pending│  │Complete│  │Revenue│          │
│  │ 247  │  │  12   │  │  235  │  │$3,705 │          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
│                                                     │
│  [All Statuses ▼]  [🔄 Refresh]                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │Order ID │Domain    │Status    │Price │...  │  │
│  ├─────────────────────────────────────────────┤  │
│  │a1b2c3..│example.com│registered│$15.99│...  │  │
│  │d4e5f6..│test.com  │pending   │$15.99│...  │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```
- 4 stat cards at top
- Filter dropdown and refresh button
- Data table with all orders
- Status badges with color coding
- Hover effects on rows

---

### 4. About Page

```
┌─────────────────────────────────────────────────────┐
│                About joni.bz                        │
│                                                     │
│  Our Mission                                        │
│  ─────────────────────────────────────────────     │
│  We believe domain registration should be as        │
│  modern as the internet itself...                   │
│                                                     │
│  How We're Different                                │
│  ─────────────────────────────────────────────     │
│  ✅ No credit card required                         │
│  ✅ No lengthy sign-up forms                        │
│  ✅ Automated registration process                  │
│                                                     │
│  Frequently Asked Questions                         │
│  ─────────────────────────────────────────────     │
│  ┌──────────────────────────────────────────┐     │
│  │ How long does registration take?          │     │
│  │ Once your payment is confirmed...         │     │
│  └──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```
- Clean, readable layout
- Section headings with gradient
- FAQ items in light gray boxes
- Generous spacing

---

## UI Components

### Buttons
- **Primary**: White text on purple gradient, shadow on hover, lift effect
- **Secondary**: Purple text with purple border, background on hover
- **Sizes**: Regular (padding: 0.75rem 1.5rem), Large (1rem 2rem)

### Cards
- White background
- Border-radius: 16px (landing), 12px (features)
- Shadow: Subtle on default, enhanced on hover
- Padding: 2rem (32px)

### Inputs
- Border: 2px solid light gray
- Focus: Purple border
- Border-radius: 8px
- Padding: 12px

### Badges
- Border-radius: 20px (crypto) or 12px (status)
- Semi-transparent background
- Colored text matching background

### Status Colors
- **Pending**: Yellow (`#fff3cd` bg, `#856404` text)
- **Confirming**: Blue (`#d1ecf1` bg, `#0c5460` text)
- **Paid/Registered**: Green (`#d4edda` bg, `#155724` text)
- **Failed/Expired**: Red (`#f8d7da` bg, `#721c24` text)

---

## Animations

### Hero Card
- Float animation: 3s ease-in-out infinite
- Moves up/down 20px

### Status Dot
- Pulse animation: 2s ease-in-out infinite
- Opacity fades 1 → 0.5 → 1

### Loading Spinner
- Spin animation: 1s linear infinite
- Border-top rotates 360°

### Hover Effects
- **Feature Cards**: translateY(-5px), shadow increase
- **Buttons**: translateY(-2px), shadow increase
- **Crypto Cards**: Background changes to gradient

### Page Transitions
- Fade in: opacity 0 → 1, translateY 20px → 0
- Duration: 0.5s ease

---

## Responsive Design

### Desktop (1200px+)
- 2-column hero layout
- 3-column feature grid
- Full navigation menu
- Maximum content width: 1200px

### Tablet (768px - 1199px)
- 2-column feature grid
- Navigation remains horizontal
- Hero might stack vertically

### Mobile (<768px)
- 1-column layout everywhere
- Hero text centered
- Navigation font size reduced
- Step arrows rotate 90° (vertical)
- Tables scroll horizontally

---

## Accessibility

- **Color Contrast**: All text meets WCAG AA standards
- **Focus States**: Visible purple outlines on interactive elements
- **Font Sizes**: Minimum 14px, scalable with rem units
- **Semantic HTML**: Proper heading hierarchy, labels for inputs
- **Alt Text**: All icons have meaning conveyed through text too

---

## Performance Features

- **Font Display**: swap (prevents text flash)
- **Preconnect**: Google Fonts for faster loading
- **SVG Icons**: Scalable, lightweight
- **Inline Critical CSS**: Above-the-fold styles inline (optional)
- **Lazy Load**: QR code library only loaded on search page

---

## Brand Identity

### Logo
- 🌐 Globe emoji + "joni.bz" text
- Gradient applied to text
- Modern, tech-forward feel

### Voice
- Professional but approachable
- Technical accuracy with simplicity
- Trustworthy and transparent

### Visual Style
- Modern gradients (not flat)
- Generous white space
- Subtle shadows (depth)
- Smooth animations (not jarring)
- Clean typography (excellent readability)

---

**This design creates a professional, modern experience that builds trust while making crypto domain purchases feel simple and accessible.**
