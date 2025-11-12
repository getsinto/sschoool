'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminCreateLiveClassPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Live Class</h1>
        <p className="text-gray-600 mt-2">
          Schedule a new Zoom meeting for students
        </p>
      </div>

      <Card className="p-6">
        <p className="text-center text-gray-600">
          Admin live class creation form - Similar to teacher form
        </p>
      </Card>
    </div>
  );
}
