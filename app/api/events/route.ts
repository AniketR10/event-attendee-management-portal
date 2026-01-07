import {json, z} from "zod"
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const createEventSchema = z.object({
    title: z.string().min(3, "Title must of atleast 3 characters"),
    description: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    capacity: z.number().min(1, "Capacity must be atleast 1"),
});

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: {date: 'asc'},
            include: {
                _count: {
                    select: {attendees: true},
                },
            },
        });
        return NextResponse.json(events);
    } catch(e) {
        return NextResponse.json({error: `failed to fetch events... ${e}`}, {status: 500});
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = createEventSchema.safeParse(body);
        if(!validation.success){
            const pretty = z.prettifyError(validation.error);
            return NextResponse.json({error: pretty}, {status: 400})
        }

        const event = await prisma.event.create({
            data: validation.data
        });

        return NextResponse.json(event, {status: 201});
    } catch(e){
        return NextResponse.json({error: `failed to create event ${e}`}, {status: 500})
    }
}