import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export type Event = {
    id: string;
    title: string;
    description?: string;
    date: string;
    capacity: number;
    _count?: {attendees: number};
};

export type CreateEventInput = {
    title: string;
    description?: string;
    date: Date;
    capacity: number;
}

// fetch events
export function useEvents() {
    return useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const {data} = await axios.get<Event[]>("/api/events");
            return data;
        },
    });
}

// create event
export function useCreateEvent() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (newEvent: CreateEventInput) => {
            const {data} = await axios.post("/api/events", newEvent);
            return data;
        },
        // optimistic update
        onMutate: async (newEvent) => {
            await queryClient.cancelQueries({queryKey: ["events"]});
            const prevEvents = queryClient.getQueryData(["events"]);

            queryClient.setQueryData<Event[]>(["events"], (old = []) =>[
                ...old, {
                    ...newEvent,
                    id: "id-" + Math.random(),
                    date: newEvent.date.toISOString(),
                    _count: {attendees: 0}
                },
            ]);
            return {prevEvents};
        },
        onError: (err, newEvent, context) => {
            queryClient.setQueryData(["events"], context?.prevEvents);
            toast.error("Failed to create event.")
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ["events"]});
           
        },
        onSuccess: () => {
            toast.success("Event created successfully!")
        }
        
    })
}
