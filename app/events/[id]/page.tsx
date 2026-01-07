"use client";

import { useAttendees, useRegisterAttendee } from "@/hooks/useAttendees";
import { useEvents } from "@/hooks/useEvents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import {useForm} from "react-hook-form"
import z from "zod";
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, Calendar, Mail, Trash2 } from "lucide-react";
import { useDeleteAttendee } from "@/hooks/useAttendees";
import {format} from "date-fns";


const attendeeSchema = z.object({
    name: z.string().min(2, "name is required"),
    email: z.email("invalid email address"),
});

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const {data: events} = useEvents();
    const event = events?.find((e) => e.id === eventId);

    const {data: attendees, isLoading: isLoadingAttendees} = useAttendees(eventId)
    const {mutate: register, isPending} = useRegisterAttendee(eventId)
    const { mutate: deleteAttendee, isPending: isDeletingAttendee } = useDeleteAttendee();

    const form = useForm<z.infer<typeof attendeeSchema>>({
        resolver: zodResolver(attendeeSchema)
    })

    const onSubmit = (data: z.infer<typeof attendeeSchema>) => {
        register(data, {
            onSuccess: () => form.reset(),
        });
    }

    if(!event) return <div className="p-10">Loading Event...</div>;

    const isFull = (event._count?.attendees || 0) >= event.capacity

    return (
    <main className="container mx-auto py-10 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-2 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Calendar className="mr-2 h-4 w-4" />
                {format(new Date(event.date), "PPP p")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-medium">Capacity Status</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {attendees?.length || 0} <span className="text-gray-400 text-lg">/ {event.capacity}</span>
                  </span>
                  <Badge variant={isFull ? "destructive" : "default"}>
                    {isFull ? "SOLD OUT" : "OPEN"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" /> Register Attendee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full space-y-2">
                  <Input placeholder="Full Name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="w-full space-y-2">
                  <Input placeholder="Email Address" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={isPending || isFull}>
                  {isPending ? "Adding..." : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAttendees ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : attendees?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attendees registered yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendees?.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell className="text-gray-500">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-3 w-3" />
                            {attendee.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-400">
                          {format(new Date(attendee.createdAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 hover: cursor-pointer"
                            onClick={() => {
                              if(confirm("Remove this attendee?")) {
                                  deleteAttendee({ attendeeId: attendee.id });
                              }
                            }}
                            disabled={isDeletingAttendee}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
    );
}