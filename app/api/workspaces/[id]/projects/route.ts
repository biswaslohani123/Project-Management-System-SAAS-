import Project from "@/app/models/ProjectModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


interface RouteParams {

    params: Promise<{id: string}>
};

export async function POST(req: NextRequest, { params }: RouteParams) {


    try {

        const user = await getAuthUser();

        if (!user) { 

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, {status: 401})
            
        }

        const { id } = await params;

        const { name, description, status, startDate, endDate } = await req.json();

        if (!name) {

            return NextResponse.json({

                success: false,
                 message:"Project name is required"
            }, {status: 400})
            
        }

        await connectDB()

         // Check if user belongs to workspace

         const member = await workspaceMember.findOne({

            workspace: id,
            user: user._id
         })

         if (!member) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"
            }, {status: 403})
            
         }

         // Only OWNER and ADMIN can create projects
         if (!["OWNER", "ADMIN"].includes(member.role)) {

            return NextResponse.json({

                success: false,
                message: "You do not have permission to create projects "
            }, {status: 403})
            
         }

         const project = await Project.create({

            name,
            description,
            workspace: id,
            status: status || "PLANNING",
            startDate,
            endDate
         })

         return NextResponse.json({

            success: true,
            message:"Project created successfully"
         }, {status: 201})


        
        
    } catch (error) {

        console.error("Create project error: ", error)

        return NextResponse.json({

            success: false, 
            message: "internal server error"

        }, {status: 500})
        
    }
}
// GET Workspace projects

export async function GET(req: NextRequest, { params }: RouteParams){

    try {
        
        const user = await getAuthUser()

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            }, {status: 401})
            
        }

        const { id } = await params;

        await connectDB()

        // check workspace membership

        const member = await workspaceMember.findOne({


            workspace: id,
            user: user._id
        })

        if (!member) {

            return NextResponse.json({

                success: false,
                message:"You are not a member of this workspace"

            }, {status: 403})
            
        }

        const projects = await Project.find({

            workspace: id
        }).sort({
            
            createdAt: -1
        })

        return NextResponse.json({

            success: true,
            projects
        })

    } catch (error) {

        console.error("Get projects error: ", error)

        return NextResponse.json({

            success: false,
            message:"Internal server error"
        }, {status: 500})
        
    }

}