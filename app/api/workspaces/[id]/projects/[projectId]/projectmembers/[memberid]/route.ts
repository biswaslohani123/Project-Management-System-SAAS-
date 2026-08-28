import ProjectMember from "@/app/models/ProjectMember";
import Project from "@/app/models/ProjectModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


interface RouteParams {

    params: Promise<{
        
        id: string;
        projectId: string;
        memberId: string;
    }>
}

// DELETE PROJECT MEMBER

export async function DELETE(req: NextRequest, { params }: RouteParams){

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            }, {status: 401})
            
        }

        const {id, projectId, memberId} = await params;

        await connectDB()

          // Check if current user belongs to the workspace

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

          // Only OWNER and ADMIN can remove project members

          if (!["OWNER", "ADMIN"].includes(currentMember.role)) {

            return NextResponse.json({

                success: false,
                message: "You do not have permission to remove project members"
            },{status: 403})
            
          }
        
          // Check if project belongs to this workspace
          const project = await Project.findOne({

            _id: projectId,
            workspace: id
          })

          if (!project) {

            return NextResponse.json({

                success: false,
                message: "project not found"
            }, {status: 404})
            
          }

          // Remove the member only from this project
          const projectMember = await ProjectMember.findOneAndDelete({

            _id: memberId,
            project: projectId
          })



          if (!projectMember) {

            return NextResponse.json({

                success: false,
                message: "Project member not found"

            },{status: 404})
            
          }

          return NextResponse.json({

            success: true,
            message:"project member removed successfully"
          })

    } catch (error) {

        console.error("Remove project member error:", error)

        return NextResponse.json({

            success: false,
            message:"Internal server error"

        },{status: 500})
        
    }
}




  


  