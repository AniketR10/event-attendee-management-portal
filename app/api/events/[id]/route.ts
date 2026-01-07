import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { success } from "zod";



export async function DELETE(
    req: Request,
    {params}: {params: Promise<{id: string}>}
) {
    try {
        const {id} = await params;

        await prisma.event.delete({
            where: {id},
        });
        return NextResponse.json({success: true});
    } catch(error ){
        return NextResponse.json({error: "failed to delete event"}, {status: 500});
    }
}