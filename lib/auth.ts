import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB } from './db';
import User from '@/app/models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {

    throw new Error("JWT_SECRET is not defined")
    
}

export const createToken = (userId: string) => {

    return jwt.sign(

        {
            userId
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )
}

export const verifyToken = (token: string) => {

    return jwt.verify(token, JWT_SECRET) as {

        userId: string
    }
}

export const getAuthUser = async () => {

    try {

        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

       if (!token) {

            return null;
        
       }

       const decoded = verifyToken(token)

       await connectDB();

       const user = await User.findById(decoded.userId).select("-password");

       return user
        
    } catch (error) {

        return null
        
    }
}