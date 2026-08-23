import mongoose, { Document, Model, Schema } from "mongoose";

export type WorkSpaceRole = "OWNER" | "ADMIN" | "MEMBER"

export interface IWorkspaceMember extends Document {

    workspace: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    role: WorkSpaceRole;
    createdAt: Date;
    updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>({

    workspace: {type: Schema.Types.ObjectId, ref: "Workspace", required:true},
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    role: {type: String, enum: ["OWNER", "ADMIN", "MEMBER"], default: "MEMBER", required: true}

}, {timestamps: true})

workspaceMemberSchema.index (

    {workspace: 1, user: 1},
    {unique: true}
)

const workspaceMember: Model<IWorkspaceMember> = mongoose.models.workspaceMember || mongoose.model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema)

export default workspaceMember