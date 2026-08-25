import mongoose, { Document, Model, Schema } from "mongoose";

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED";

export interface IProject extends Document {

  name: string;
  description: string;
  workspace: mongoose.Types.ObjectId;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({

  name: {type: String, required: true, trim: true, maxLength: 150},
  description: {type: String, trim: true, maxLength: 1000},
  workspace: {type: Schema.Types.ObjectId, ref: "Workspace", required: true},
  status: {type: String, enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"], default: "PLANNING"},
  startDate: {type: Date},
  endDate: {type: Date}

}, {timestamps: true})

const Project: Model<IProject> = mongoose.models.Project || mongoose.model("Project", projectSchema)

export default Project