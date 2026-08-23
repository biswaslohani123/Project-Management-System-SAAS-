import User from "@/app/models/UserModel";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {

    try {

        await connectDB();
        
        const {name, email, password} = await req.json();

        if (!name || !email || !password) {

            return NextResponse.json({

                success: false,
                message: "Name, email and password are required"

            }, {status: 400})
            
        }

        if (password.length < 8) {

            return NextResponse.json({

                success: false,
                message: "password must be at least 8 characters"

            },{status: 400})
            
        }

        const existingUser = await User.findOne({email});

        if (existingUser) {

            return NextResponse.json({

                success: false,
                message: "User already exists"
            }, {status: 409})
            
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            name,
            email,
            password: hashedPassword
        })
        
        return NextResponse.json({

            success: true,
            message: "User registered successfully",
            user: {

                id: user._id,
                name: user.name,
                email: user.email
            }
        }, {status: 201})
        
    } catch (error) {

        console.error("Registration error:", error)

        return NextResponse.json({

            success: false,
            message:"Internal server error"
        }, {status: 500})
        
    }
}

