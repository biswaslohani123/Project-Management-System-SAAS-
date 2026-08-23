import mongoose, { Model, Schema } from "mongoose";

export interface IUser extends Document {

    name: string;
    email: string;
    password: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: Date;
    updatedAt: Date
}

const userSchema = new Schema<IUser> ({

    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true, minLength: 6},
    role: {type: String, enum: ["OWNER", "ADMIN", "MEMBER"], default: "MEMBER"}

}, {timestamps: true})


const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;