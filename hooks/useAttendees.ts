import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export type Attendee = {
    id: string,
    name: string,
    email: string,
    createdAt: string,
};

export function useAttendees(eventId: string) {
    return useQuery({
        queryKey: ["attendees", eventId],
        queryFn: async () => {
           const {data} = await axios.get<Attendee[]>(`/api/events/${eventId}/attendees`);
           return data;
        },
        enabled: !!eventId,
    });
}

export function useRegisterAttendee(eventId: string) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: {name: string, email: string}) => {
            return await axios.post(`/api/events/${eventId}/attendees`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["attendees", eventId]});
            queryClient.invalidateQueries({queryKey: ["events"]});
            toast("Attendee registered successfully!")
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error || "failed to register";
            toast("registeration failed");
        }
    })
}