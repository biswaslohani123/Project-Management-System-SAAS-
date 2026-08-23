

// get members 

import User from "@/app/models/UserModel";
import workspaceMember from "@/app/models/WorkspaceMember";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


interface RouteParams {

    params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, { status: 401 })

        }

        const { id } = await params

        await connectDB();

        const currentMember = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!currentMember) {

            return NextResponse.json({

                success: false,
                message: "You are not a member of this workspace"
            }, { status: 403 })

        }

        const members = await workspaceMember.find({

            workspace: id
        }).populate("user", "name email").sort({ createdAt: 1 })

        return NextResponse.json({

            success: true,
            members
        })

    } catch (error) {

        console.error("Get members error", error)

        return NextResponse.json({

            success: false,
            message: "Internal server error"
        }, { status: 500 })

    }

}

// ADD MEMBER

export async function POST(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, { status: 401 })

        }

        const { id } = await params;

        const { email, role } = await req.json();

        if (!email) {

            return NextResponse.json({

                success: false,
                message: "Email is required"

            }, { status: 400 })

        }

        if (!["ADMIN", "MEMBER"].includes(role)) {

            return NextResponse.json({

                success: false,
                message: "Invalid role"
            })

        }

        await connectDB()

        const currentMember = await workspaceMember.findOne({

            workspace: id,
            user: user._id
        })

        if (!currentMember) {

            return NextResponse.json({

                success: false,
                message: "You are not  a member of this worksapce"
            }, { status: 403 })

        }

        if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {

            return NextResponse.json({

                success: false,
                message: "You do not have permission to add member"
            }, { status: 403 })

        }

        const newUser = await User.findOne({ email })

        if (!newUser) {

            return NextResponse.json({

                success: false,
                message: "User not found. They must register first"
            }, { status: 404 })

        }

        const existingMember = await workspaceMember.findOne({

            workspace: id,
            user: newUser._id
        })

        if (existingMember) {

            return NextResponse.json(
                {
                    success: false,
                    message: "User is already a member",
                },
                { status: 409 }
            );

        }

        const member = await workspaceMember.create({

            workspace: id,
            user: newUser._id,
            role
        })

        return NextResponse.json(
            {
                success: true,
                message: "Member added successfully",
                member,
            },
            { status: 201 }
        );

    } catch (error) {

        console.error("Add member error", error)

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );


    }
}
