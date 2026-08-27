import mongoose, { Model, Schema } from "mongoose";

export interface IProjectMember extends Document {

    project: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    
}

const projectMemberSchema = new Schema<IProjectMember>({

    project: {type: Schema.Types.ObjectId, ref: "Project", required: true},
    user: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true})

// Prevent the same user from being added twice

projectMemberSchema.index(

    {project: 1, user: 1},
    {unique: true}
)

const ProjectMember: Model<IProjectMember> = mongoose.models.ProjectMember || mongoose.model<IProjectMember>("ProjectMember", projectMemberSchema)

export default ProjectMember