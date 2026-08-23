import Workspace from "@/app/models/WokSpaceModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

    try {

        const user = await getAuthUser()

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"


            }, {status: 401})
            
        }

        const {name, description} = await req.json()

        if (!name) {
            
            return NextResponse.json({

                success: false,
                 message: "Workspace name is required"
            }, {status: 400})
            
        }

        await connectDB();

        const workspace = await Workspace.create({
            name,
            description,
            owner: user._id
        }) 

        await workspaceMember.create({

            workspace: workspace._id,
            user: user._id,
            role: "OWNER"
        })

        return NextResponse.json({

            success: true,
            message: "Workspace created successfully",
            workspace

        }, {status: 201})
        
        
    } catch (error) {

        console.error("Create workspace error:", error )

        return NextResponse.json({

            success: false,
            message: "Internal server error"

        }, {status: 500})
        
    }
}


// GET Workspace

export async function GET() {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false, 
                message: "Unauthorized"

            },{status: 401})
            
        }

        await connectDB()

        const workspace = await Workspace.find({


            owner: user._id
        }).sort({createdAt: -1})

        return NextResponse.json({

            success: true,
            workspace
        })
        
    } catch (error) {

        console.error("Get workspace error", error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"
        }, {status: 500})
        
    }
}