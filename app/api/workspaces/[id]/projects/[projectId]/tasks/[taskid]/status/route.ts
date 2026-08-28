import Project from "@/app/models/ProjectModel";
import Task from "@/app/models/TaskModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


interface RouteParams {

    params: Promise<{

        id: string;
        projectId: string;
        taskId: string
    }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user ) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            },{status: 401})
            
        }

        const {id, projectId, taskId} = await params;

        const { status } = await req.json();

        const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]

        if (!validStatuses.includes(status)) {


            return NextResponse.json({

                success: false,
                message: "Invalid task status"
            },{status: 400})
            
        }

        await connectDB()

           // 1. Check workspace membership

           const currentMember = await workspaceMember.findOne({

                workspace: id,
                user: user._id
           })

           if (!currentMember) {

            return NextResponse.json({

                success: false,
                message:"You are not a member of this workspace"
            },{status: 403})
            
           }

            // 2. Check project belongs to workspace

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

            // 3. Find task inside the project

            const task = await Task.findOne({

                _id: taskId,
                project: projectId
            })

            if (!task) {

                return NextResponse.json({

                    success: false,
                    message: "Task not found"
                },{status: 404})
                
            }

            // 4. Permission check
            const isOwnerAdmin = ["OWNER", "ADMIN"].includes(currentMember.role)

            const isAssignedUser = task.assignedTo && task.assignedTo.toString() === user._id.toString()

            if (!isOwnerAdmin && !isAssignedUser) {

                return NextResponse.json({

                    success: false, 
                    message: "You can only update the status of status assigned to you"
                },{status: 403})
                
            }

               // 5. Update status

               task.status = status;

               await task.save()

               return NextResponse.json({

                success: true,
                message: "Task status updated successfully",
                task
               })
        
    } catch (error) {
        console.error("Update task status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  
        
    }
}