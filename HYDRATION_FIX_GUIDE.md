# Hydration Fix Guide - Next.js 13+ App Router

## Problem Fixed
1. ✅ Created `/api/placeholder/[width]/[height]` route that returns SVG placeholders
2. ✅ Hydration mismatch warnings from mixing server/client code
3. ✅ Extra attributes warnings from browser extensions

## 1. Placeholder API Route

**Location:** `app/api/placeholder/[width]/[height]/route.ts`

**Usage:**
```tsx
<img src="/api/placeholder/300/200" alt="Placeholder" />
```

The route accepts width and height parameters and returns a lightweight SVG image with dimensions displayed.

## 2. Hydration Mismatch Prevention

### Rule 1: Server Components (Default)
Server Components should ONLY contain:
- Static rendering
- Data fetching (async/await)
- No browser APIs (window, document, localStorage)
- No event handlers (onClick, onChange, etc.)
- No hooks (useState, useEffect, etc.)

**Example - Server Component:**
```tsx
// app/page.tsx (Server Component by default)
import { ClientButton } from '@/components/ClientButton';

export default async function Page() {
  // ✅ Data fetching is fine
  const data = await fetch('https://api.example.com/data');
  
  return (
    <div>
      <h1>Server Rendered Title</h1>
      {/* ✅ Pass data to client component */}
      <ClientButton initialCount={0} />
    </div>
  );
}
```

### Rule 2: Client Components
Client Components MUST have `"use client"` directive and can use:
- Browser APIs (window, document, localStorage)
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Interactive features

**Example - Client Component:**
```tsx
// components/ClientButton.tsx
'use client';

import { useState } from 'react';

interface ClientButtonProps {
  initialCount: number;
}

export function ClientButton({ initialCount }: ClientButtonProps) {
  const [count, setCount] = useState(initialCount);
  
  // ✅ Event handlers work here
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <button onClick={handleClick} className="px-4 py-2 bg-blue-500 text-white">
      Clicked {count} times
    </button>
  );
}
```

### Rule 3: Composition Pattern
Server Components can render Client Components, but not vice versa.

**Example - Correct Pattern:**
```tsx
// app/dashboard/page.tsx (Server Component)
import { InteractiveCard } from '@/components/InteractiveCard';

export default async function DashboardPage() {
  const userData = await fetchUserData();
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* ✅ Server Component renders Client Component */}
      <InteractiveCard data={userData} />
    </div>
  );
}
```

```tsx
// components/InteractiveCard.tsx (Client Component)
'use client';

import { useState } from 'react';

export function InteractiveCard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border rounded p-4">
      <h2>{data.title}</h2>
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {expanded && <div>{data.content}</div>}
    </div>
  );
}
```

## 3. Common Hydration Issues & Fixes

### Issue 1: Using window/document in Server Components
❌ **Wrong:**
```tsx
// app/page.tsx
export default function Page() {
  const width = window.innerWidth; // ❌ Error!
  return <div>Width: {width}</div>;
}
```

✅ **Correct:**
```tsx
// app/page.tsx (Server Component)
import { ClientWidth } from '@/components/ClientWidth';

export default function Page() {
  return <ClientWidth />;
}
```

```tsx
// components/ClientWidth.tsx
'use client';

import { useState, useEffect } from 'react';

export function ClientWidth() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
    
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>Width: {width}px</div>;
}
```

### Issue 2: Event Handlers in Server Components
❌ **Wrong:**
```tsx
// app/page.tsx
export default function Page() {
  return (
    <button onClick={() => alert('Hi')}>Click</button> // ❌ Error!
  );
}
```

✅ **Correct:**
```tsx
// app/page.tsx
import { ClickableButton } from '@/components/ClickableButton';

export default function Page() {
  return <ClickableButton />;
}
```

```tsx
// components/ClickableButton.tsx
'use client';

export function ClickableButton() {
  return (
    <button onClick={() => alert('Hi')}>Click</button>
  );
}
```

### Issue 3: localStorage Access
❌ **Wrong:**
```tsx
// app/page.tsx
export default function Page() {
  const theme = localStorage.getItem('theme'); // ❌ Error!
  return <div>Theme: {theme}</div>;
}
```

✅ **Correct:**
```tsx
// app/page.tsx
import { ThemeDisplay } from '@/components/ThemeDisplay';

export default function Page() {
  return <ThemeDisplay />;
}
```

```tsx
// components/ThemeDisplay.tsx
'use client';

import { useState, useEffect } from 'react';

export function ThemeDisplay() {
  const [theme, setTheme] = useState<string | null>(null);
  
  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);
  
  if (!theme) return <div>Loading theme...</div>;
  
  return <div>Theme: {theme}</div>;
}
```

## 4. Extra Attributes Warning Fix

The warning `Extra attributes from the server: __processed_dc63836f..., bis_register` is caused by browser extensions (like password managers) injecting attributes.

**Fix:** Suppress this specific warning in your root layout:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Suppress browser extension hydration warnings
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Extra attributes from the server')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
```

## 5. Complete Working Example

### Server Component with Client Interactivity
```tsx
// app/products/page.tsx (Server Component)
import { ProductCard } from '@/components/ProductCard';

async function getProducts() {
  const res = await fetch('https://api.example.com/products');
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// components/ProductCard.tsx (Client Component)
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const handleAddToCart = () => {
    // Client-side logic
    console.log(`Adding ${quantity} of ${product.name} to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <Image
        src={product.image || '/api/placeholder/300/200'}
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="text-xl font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-1 border rounded"
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-1 border rounded"
        >
          +
        </button>
      </div>
      
      <button
        onClick={handleAddToCart}
        className={`w-full mt-4 px-4 py-2 rounded ${
          added ? 'bg-green-500' : 'bg-blue-500'
        } text-white`}
      >
        {added ? '✓ Added!' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

## 6. Testing Checklist

- [ ] No `window`, `document`, or `localStorage` in Server Components
- [ ] No event handlers (`onClick`, etc.) in Server Components
- [ ] No React hooks in Server Components
- [ ] All interactive components have `"use client"` directive
- [ ] Props passed from Server to Client Components are serializable
- [ ] Images use `/api/placeholder/[width]/[height]` for placeholders
- [ ] No hydration warnings in browser console
- [ ] Works in both development and production builds

## 7. Deployment to Vercel

This solution works on Vercel without any additional configuration:
- API routes are automatically deployed as serverless functions
- Server Components render on the server
- Client Components hydrate properly on the client
- No 404 errors for placeholder images

## Summary

✅ **Placeholder API:** `/api/placeholder/[width]/[height]` returns SVG images  
✅ **Server Components:** Use for static content and data fetching  
✅ **Client Components:** Use `"use client"` for interactivity  
✅ **Composition:** Server Components can render Client Components  
✅ **No Hydration Errors:** Proper separation prevents mismatches  
