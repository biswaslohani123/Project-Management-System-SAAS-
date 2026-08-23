import Workspace from "@/app/models/WokSpaceModel";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


// GET SINGLE WORKSPACE
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

        const { id } = await params;

        await connectDB()

        const workspace = await Workspace.findOne({

            _id: id,
            owner: user._id
        })

        if (!workspace) {

            return NextResponse.json({

                success: false,
                message: "Workspace not found"


            }, { status: 404 })

        }

        return NextResponse.json({

            success: true,
            workspace
        })

    } catch (error) {

        console.error("Get workspace error:", error)

        return NextResponse.json({

            success: false,
            message: "internal server error"

        }, { status: 500 })

    }

}

// update workspace


export async function PUT(req: NextRequest, { params }: RouteParams) {

    try {

        const user = await getAuthUser()

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, { status: 401 })

        }

        const { id } = await params;

        const { name, description } = await req.json();


        if (!name) {

            return NextResponse.json({

                success: false,
                message: "Workspace name is required"

            }, { status: 400 })

        }

        await connectDB()

        const workspace = await Workspace.findOneAndUpdate(
            {
                _id: id,
                owner: user._id,
            },
            {
                name,
                description,
            },
            {
                new: true,
                runValidators: true,
            }
        );
        
        if (!workspace) {

            return NextResponse.json({

                success: false,
                message: "Workspace not found"

            }, {status: 404})
            
        }

        return NextResponse.json({

            success: true,
            message:"Workspace updated successfully",
            workspace
        })

    } catch (error) {

        console.error("Update workspace error:", error)

        return NextResponse.json({

            success: false,
            message: "internal server error"
        }, {status: 500})

    }
}

// DELETE WorkSPACE

export async function DELETE(req: NextRequest, { params }: RouteParams){

    try {

        const user = await getAuthUser();

        if (!user) {

            return NextResponse.json({

                success: false,
                message: "Unauthorized"

            }, {status: 401})
            
        }

        const { id } = await params;

        await connectDB()

        const workspace = await Workspace.findByIdAndDelete({

            _id: id,
            owner: user._id
        })

        if (!workspace) {

            return NextResponse.json({

                success: false,
                message: "Workspace not found"
            }, {status: 404})
            
        }

        return NextResponse.json({

            success: false, 
            message: "Workspace deleted successfully"
        })
        
    } catch (error) {

        console.error("Delete workspace error:", error)

        return NextResponse.json({

            success: false, 
            message: "Internal server error"
            
        }, {status: 500})
        
    }

}

