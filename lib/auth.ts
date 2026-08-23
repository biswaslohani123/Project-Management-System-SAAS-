import jwt from 'jsonwebtoken';

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