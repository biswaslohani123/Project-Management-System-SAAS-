import Project from "@/app/models/ProjectModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";



interface RouteParams {

    params: Promise<{ id: string, projectId: string }>;
}


// GET SINGLE PROJECT

export async function GET(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            }, { status: 401 })

        }

        const { id, projectId } = await params;

        await connectDB();

        // Check if the user belongs to this workspace

        const member = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!member) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"
            }, { status: 403 })

        }


        // Find the project inside this workspace

        const project = await Project.findOne({

            _id: projectId,
            workspace: id
        })

        if (!project) {

            return NextResponse.json({

                success: false,
                message: "Project not found"
            }, { status: 404 })

        }

        return NextResponse.json({

            success: true,
            project
        })


    } catch (error) {

        console.error("Get project error", error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"
        }, { status: 500 })

    }
}


// UPDATE PROJECT

export async function PUT(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, { status: 401 })

        }

        const { id, projectId } = await params;

        const { name, description, status, startDate, endDate } = await req.json()

        if (!name) {

            return NextResponse.json({

                success: false,
                message: "Project name is required"
            }, { status: 400 })

        }

        await connectDB()

        // Check if user belongs to this workspace

        const member = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!member) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"
            }, { status: 403 })

        }

        // Only OWNER and ADMIN can update projects

        if (!["OWNER", "ADMIN"].includes(member.role)) {

            return NextResponse.json({

                success: false,
                message: "You do not have permission to update projects"
            }, { status: 403 })

        }

        // Find and update project inside this workspace

        const project = await Project.findOneAndUpdate({

            _id: projectId,
            workspace: id
        },
            {

                name,
                description,
                status,
                startDate,
                endDate
            }, {
            new: true,
            runValidators: true
        })

        if (!project) {

            return NextResponse.json({

                success: false,
                message: "Project not found"
            }, { status: 404 })

        }


        return NextResponse.json({


            success: true,
            message: "Project updated successfully",
            project
        })

    } catch (error) {

        console.error("Update project error", error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"


        }, { status: 500 })

    }


}

// DELETE PROJECT - ONLY OWNER CAN DELETE PROJECT

export async function DELETE(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"
            }, { status: 401 })

        }

        const { id, projectId } = await params;

        await connectDB()

        // Check if the user belongs to the workspace

        const member = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!member) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"
            }, { status: 403 })

        }
        // Only OWNER can delete a project

        if (member.role !== "OWNER") {

            return NextResponse.json(
                {
                    success: false,
                    message: "Only the workspace owner can delete projects",
                },
                { status: 403 }
            );

        }

        // Delete project only if it belongs to this workspace

        const project = await Project.findByIdAndDelete({

            _id: projectId,
            workspace: id
        })

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully",
        });

    } catch (error) {

        console.error("Delete project error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );


    }


}