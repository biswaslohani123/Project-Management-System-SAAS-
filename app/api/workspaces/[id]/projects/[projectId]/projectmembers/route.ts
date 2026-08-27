import ProjectMember from "@/app/models/ProjectMember";
import Project from "@/app/models/ProjectModel";
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

export async function POST(req: NextRequest, {params}: RouteParams) {

        try {

            const user = await getAuthUser();

            if (!user) {

                return NextResponse.json({

                    success: false,
                    message: "Unauthorized"

                },{status: 401})
                
            }

            const {id, projectId} = await params;

            const { userId } = await req.json();

            if (!userId) {

                return NextResponse.json({

                    success: false,
                    message: "userID is required"

                }, {status: 400})
                
            }

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

                }, {status: 403})
                
            }

             // Only OWNER and ADMIN can add project members

             if (!["OWNER", "ADMIN"].includes(currentMember.role)) {

                return NextResponse.json({

                    success: false,
                    message:"You do not have permission to add project members"

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
                    message: "Project not found"

                },{status: 404})
                
              }

               // Check if already added to this project
               const existingProjectMember = await ProjectMember.findOne({

                    project: projectId,
                    user: userId
               })

               if (existingProjectMember) {

                return NextResponse.json({

                    success: false,
                    message: "User is already a member of this project"
                },{status: 409})
                
               }

                // Add user to project
                const projectMember  = await ProjectMember.create({

                    project: projectId,
                    user: userId
                })

                return NextResponse.json({

                    success: true,
                    message: "Member added to project successfully",
                    projectMember

                }, {status: 201})

                        
        } catch (error) {

            console.error("Add project member error: ", error)

            return NextResponse.json({
                
                success: false,
                message: "Internal server error"
            }, {status: 500})
            
        }
}

// GET PROJECT MEMBERS

export async function GET(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, {status: 401})
            
        }

        const { id, projectId } = await params;

        await connectDB();
        
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

        // Check if project belongs to this workspace

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

         // Get all project members and user information

         const projectMembers = await ProjectMember.find({

            project: projectId,
         }).populate("user", "name email").sort({createdAt: -1})

         return NextResponse.json({

            success: true, 
            projectMembers
         })

        
    } catch (error) {

        console.error("Get project members error:",error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"
        }, {status: 500})
        
    }
}



