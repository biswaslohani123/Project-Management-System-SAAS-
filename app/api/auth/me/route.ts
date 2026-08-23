import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";


export async function GET() {

    try {

        const user  = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            }, {status: 401})
            
        }

        return NextResponse.json({
            
            success: true,
            user
        });
        
    } catch (error) {

        return NextResponse.json({

            success: false,
            message:"Internal server error"
            
        }, {status: 500})
        
    }
}