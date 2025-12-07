// ============================================
// CORRECT PATTERN: Server + Client Components
// ============================================

// ----------------
// Server Component (app/example/page.tsx)
// ----------------
import { InteractiveSection } from '@/components/InteractiveSection';

// ✅ Server Component - async data fetching
export default async function ExamplePage() {
  // ✅ Fetch data on the server
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  
  return (
    <div className="container mx-auto p-8">
      {/* ✅ Static server-rendered content */}
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <p className="text-gray-600 mb-8">This is server-rendered content</p>
      
      {/* ✅ Pass data to client component */}
      <InteractiveSection initialData={data} />
      
      {/* ✅ Use placeholder API for images */}
      <img 
        src="/api/placeholder/400/300" 
        alt="Placeholder" 
        className="rounded-lg mt-8"
      />
    </div>
  );
}

// ----------------
// Client Component (components/InteractiveSection.tsx)
// ----------------
'use client'; // ✅ Required for interactivity

import { useState, useEffect } from 'react';

interface InteractiveSectionProps {
  initialData: any;
}

export function InteractiveSection({ initialData }: InteractiveSectionProps) {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<string>('light');
  
  // ✅ useEffect for browser APIs
  useEffect(() => {
    // ✅ Safe to use window/localStorage here
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // ✅ Safe to use window
    const handleResize = () => {
      console.log('Window width:', window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ✅ Event handlers work in client components
  const handleClick = () => {
    setCount(count + 1);
    localStorage.setItem('clickCount', String(count + 1));
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <h2 className="text-2xl font-semibold mb-4">Interactive Section</h2>
      
      {/* ✅ Display server data */}
      <p className="mb-4">Server data: {JSON.stringify(initialData)}</p>
      
      {/* ✅ Interactive buttons */}
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        Clicked {count} times
      </button>
      
      <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        Toggle Theme ({theme})
      </button>
    </div>
  );
}

// ============================================
// WRONG PATTERNS (Don't do this!)
// ============================================

// ❌ WRONG: Event handler in Server Component
export function WrongServerComponent() {
  return (
    <button onClick={() => alert('Hi')}>Click</button>
    // Error: Event handlers cannot be passed to Client Component props
  );
}

// ❌ WRONG: Using window in Server Component
export function WrongWindowUsage() {
  const width = window.innerWidth; // Error: window is not defined
  return <div>Width: {width}</div>;
}

// ❌ WRONG: useState in Server Component
export function WrongHookUsage() {
  const [count, setCount] = useState(0); // Error: useState is not a function
  return <div>{count}</div>;
}

// ❌ WRONG: localStorage in Server Component
export function WrongLocalStorage() {
  const theme = localStorage.getItem('theme'); // Error: localStorage is not defined
  return <div>{theme}</div>;
}

// ============================================
// CORRECT FIXES
// ============================================

// ✅ FIX 1: Move event handler to Client Component
// Server Component
export function CorrectServerComponent() {
  return <ClickButton />;
}

// Client Component
'use client';
function ClickButton() {
  return <button onClick={() => alert('Hi')}>Click</button>;
}

// ✅ FIX 2: Move window usage to Client Component with useEffect
'use client';
import { useState, useEffect } from 'react';

export function CorrectWindowUsage() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  
  return <div>Width: {width}px</div>;
}

// ✅ FIX 3: Use Client Component for state
'use client';
import { useState } from 'react';

export function CorrectHookUsage() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// ✅ FIX 4: Use Client Component for localStorage
'use client';
import { useState, useEffect } from 'react';

export function CorrectLocalStorage() {
  const [theme, setTheme] = useState<string>('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);
  
  return <div>Theme: {theme}</div>;
}
