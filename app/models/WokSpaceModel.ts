import mongoose, { Model, Schema } from "mongoose";


export interface IWorkSpace extends Document {

    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

}

const workspaceSchema = new Schema<IWorkSpace>({

    name: {type: String, required: true, trim: true, maxLength: 100},
    description: {type: String, trim: true, maxLength: 500},
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true}

}, {timestamps: true})

const Workspace: Model<IWorkSpace> = mongoose.models.Workspace || mongoose.model<IWorkSpace>("Workspace", workspaceSchema)

export default Workspace