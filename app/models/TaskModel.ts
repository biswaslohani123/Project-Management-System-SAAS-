import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ITask extends Document {

    title: string;
    description: string;
    project: mongoose.Types.ObjectId;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    dueDate?: Date;
    createdAt: Date;
    updateAt: Date
}

const taskSchema = new Schema<ITask> ({

    title: {type: String, required: true, trim: true, maxLength: 200},
    description: {type: String, trim: true, maxLength: 5000},
    project: {type: Schema.Types.ObjectId, ref: "Project", required: true},
    status: {type: String, enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"], default: "TODO"},
    priority: {type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM"},
    assignedTo: {type: Schema.Types.ObjectId, ref: "User", default: null},
    createdBy: {type: Schema.Types.ObjectId, ref:"User", required: true},
    dueDate: {type: Date}

},{timestamps: true})

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema)

export default Task;