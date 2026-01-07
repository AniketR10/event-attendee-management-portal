import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import z from "zod"

const regiterAttendeeSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
});

export async function GET(
    req: Request,
    {params}: {params: Promise<{id: string}>}
) {
    try {
            const {id} = await params;
        const attendees = await prisma.attendee.findMany({
            where: {eventId: id},
            orderBy: {createdAt: 'desc'},
        });
        return NextResponse.json(attendees);
    } catch(e) {
        return NextResponse.json({error: `error fetching attendees, ${e}`}, {status: 500});
    }
}

export async function POST(
    req:Request,
    {params}: {params: Promise<{id: string}>}
) {
    try {
        const {id} = await params;
        const body = await req.json();
        const eventId = id;

        const validation = regiterAttendeeSchema.safeParse(body);
        if(!validation.success){
            const pretty = z.prettifyError(validation.error)
            return NextResponse.json({error: pretty}, {status: 400});
        }

        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: {id: eventId},
                include: {
                    _count: {
                        select: {
                            attendees: true
                        }
                    }
                }
            });
            if(!event) throw new Error("Event not found");

            if(event._count.attendees >= event.capacity){
                throw new Error("Event is fully booked");
            }

            const attendee = await tx.attendee.create({
                data: {
                    ...validation.data,
                    eventId,
                },
            });
            return attendee;
        });

        return NextResponse.json(result, {status: 201});
    } catch(e:any){
        if(e.message === "Event is fully booked") {
            return NextResponse.json({error:"Event is fully booked"}, {status: 409})
        }
        if(e.code === 'P2002') {
            return NextResponse.json({ error: "Email already registered for this event" }, { status: 409 });
        }
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}