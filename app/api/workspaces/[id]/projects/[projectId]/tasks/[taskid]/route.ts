import ProjectMember from "@/app/models/ProjectMember";
import Project from "@/app/models/ProjectModel";
import Task from "@/app/models/TaskModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


interface RouteParams {

    params: Promise <{

        id: string;
        projectId: string;
        taskId: string;

    }>;
}

export async function GET(req: NextRequest, { params }: RouteParams){

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            },{status: 401 })
            
        }

        const {id, projectId, taskId} = await params;

        await connectDB();;

         // 1. Check if the user belongs to the workspace

         const currentMember = await workspaceMember.findOne({

            workspace: id,
            user: user._id
         })

         if (!currentMember) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"

            },{status: 403 })
            
         }

         // 2. Check if the project belongs to this workspace

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

        // 3. Find the task inside this project

        const task = await Task.findOne({

            _id: taskId,
            project: projectId

        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
        
        if (!task) {

            return NextResponse.json({

                success: false,
                message: "Task not found"
                

            },{status: 404})
            
        }

        return NextResponse.json({

            success: true,
            task
        })
    
    } catch (error) {

        console.error("Get single task error:", error)

        return  NextResponse.json({

            success: false,
            message: "Internal server error"
            
        },{status: 500})
        
    }
}

  // PUT UPDATE


  export async function PUT(req: NextRequest, { params } : RouteParams){

    try {

      const user = await getAuthUser();

      if (!user) {

        return NextResponse.json({

          success: false,
          message: "Unauthorized"
        },{status: 401})
        
      }

      const {id, projectId, taskId} = await params;

      const {title, description, priority, assignedTo, dueDate} = await req.json()

      if (!title) {

        return NextResponse.json({

            success: false,
            message: "Task title is required"
        },{status: 400})
        
      }

    await connectDB()

      // 1. Check if the user belongs to the workspace

      const currentMember = await workspaceMember.findOne({

        workspace: id,
        user: user._id
      })

      if (!currentMember) {

        return NextResponse.json({

            success: false, 
            message: "you are not a member of this workspace"
        },{status: 403})
        
      }
       // 2. Only OWNER and ADMIN can update task details

      if (!["OWNER", "ADMIN"].includes(currentMember.role)) {

        return NextResponse.json({

            success: false,
            message:"You do not have permission to update this task"
        },{status: 403})
        
      }

      // 2. Check if the project belongs to this workspace

      const project = await Project.findOne({

        _id: projectId,
        workspace: id
      })

      if (!project) {

        return NextResponse.json({

            success: false,
            message:"Project not found"
        },{status: 404})
        
      }

        // 4. If assignedTo is provided, check if user is a project member

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

           // 5. Update task

           const task = await Task.findOneAndUpdate({

             _id: taskId,
             project: projectId

           },{

                title,
                description,
                priority,
                assignedTo: assignedTo || null,
                dueDate
           },{

            new: true,
            runValidators: true
           })

           if (!task) {

            return NextResponse.json({

                success: false,
                message:"Task Not Found"
            },{status: 404})
            
           }

           return NextResponse.json({

            success: true,
            message:"TasK updated successfully",
            task
           })

    } catch (error) {

        console.error("Update task error", error)
        
        return NextResponse.json({

            success: false,
            message:"Internal server error"
        },{status: 500})
      
    }
  }