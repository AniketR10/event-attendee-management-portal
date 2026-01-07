import { Event } from "@/hooks/useEvents";
import { Card, CardHeader, CardTitle, CardContent,CardFooter  } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CalendarDays, Users } from "lucide-react";
import {format} from "date-fns";
import Link from "next/link";


export function EventCard({event} : {event: Event}) {
    const attendeeCount = event._count?.attendees ?? 0;
    const isFull = attendeeCount >= event.capacity;

    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-bold truncate leading-tight" title={event.title}>
            {event.title}
          </CardTitle>
          <Badge variant={isFull ? "destructive" : "secondary"} className="shrink-0">
            {attendeeCount} / {event.capacity}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <CalendarDays className="mr-2 h-4 w-4" />
          {format(new Date(event.date), "PPP")}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-10">
          {event.description || "No description provided."}
        </p>
      </CardContent>

      <CardFooter>
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Attendees
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}