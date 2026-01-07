"use client";

import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/EventCard";
import { CreateEventModal } from "@/components/CreateEventModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {

  const { data: events, isLoading, isError, refetch } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="bg-red-50 p-4 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium">Failed to load events.</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and registrations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="shrink-0 hover:cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 border rounded-xl bg-white shadow-sm">
              <Skeleton className="h-31.25 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-62.5" />
                <Skeleton className="h-4 w-50" />
              </div>
            </div>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-slate-50/50">
          <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No events found</h3>
          <p className="text-slate-500 mb-6 max-w-sm text-center">
            You haven't created any events yet. Click the button below to get started.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Create your first Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <CreateEventModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </main>
  );
}