import ProjectMember from "@/app/models/ProjectMember";
import Project from "@/app/models/ProjectModel";
import Task from "@/app/models/TaskModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {

    params: Promise<{

        id: string;
        projectId: string
    }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {


    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            },{status: 401})
            
        }
        
        const {id, projectId} = await params

        const {title, description, priority, assignedTo, dueDate} = await req.json();

        if (!title) {

            return NextResponse.json({

                success: false,
                message:"Task title is required"

            },{status: 400})
            
        }

        await connectDB();

         // 1. Check if current user belongs to the workspace

         const currentMember = await workspaceMember.findOne({

            workspace: id,
            user: user._id
         })

         if (!currentMember) {

            return NextResponse.json({
                
                success: false,
                message: "You are not a member of this workspace"
            },{status: 403})
            
         }

          // 2. Check if project belongs to this workspace

          const project = await Project.findOne({

            _id: projectId,
            workspace: id


          })

          if (!project) {

            return NextResponse.json({

                success: false,
                message: "Project not found"
            },{status: 404})
            
          }

           // Only OWNER and ADMIN can create tasks

           if (!["OWNER", "ADMIN"].includes(currentMember.role)) {

                return NextResponse.json({

                    success: false,
                    message: "You do not have permission to create tasks"

                },{status: 403})
            
           }

           // 4. If assigning a user, verify they are a project member

           if (assignedTo) {

                const projectMember = await ProjectMember.findOne({

                    project: projectId,
                    user: assignedTo
                })
           }

           if (!ProjectMember) {

            return NextResponse.json({

                success: false,
                message: "Assigned user is not a member of this project"

            },{status: 400})
            
           }

           // 5. Create task

           const task = await Task.create({

                title,
                description,
                project: projectId,
                priority: priority || "MEDIUM",
                assignedTo: assignedTo || null,
                createdBy: user._id,
                dueDate
           });

           return NextResponse.json({

                success: true,
                message: "Task created successfully",
                task

           }, {status: 201})

    } catch (error) {

        console.error("Create task error", error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"


        },{status: 500})
        
    }


}

// ALL OWNER , ADMIN , MEMBER  can get tasks

export async function GET(req: NextRequest,  { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) { 

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            },{status: 401})
            
        }

        const { id, projectId } = await params;
        
        await connectDB();


        // 1. Check if current user belongs to the workspace

        const currentMember = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!currentMember) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"

            },{status: 403})
        }

        // 2. Check if project belongs to this workspace

       const project = await Project.findOne({

            _id: projectId,
            workspace: id

       });

       if (!project) {

            return NextResponse.json({

                success: false,
                message: "Project not found",

            },{status: 404})
        
       }

        // 3. Get all tasks of this project

        const  tasks = await Task.find({

            project:projectId

        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({createdAt: -1})

        return NextResponse.json({

            success: true,
            tasks
        })

  
    } catch (error) {

        console.error("Get tasks error:", error);

        return NextResponse.json({

            success: false,
            message: "Internal server error"
            
        },{status: 500})
        
    }
}