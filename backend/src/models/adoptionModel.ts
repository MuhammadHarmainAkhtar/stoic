import mongoose, { Schema, Document } from "mongoose";

export enum AdoptionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

export interface IAdoption extends Document {
  user: mongoose.Types.ObjectId;
  ritual: mongoose.Types.ObjectId;
  status: AdoptionStatus;
  progress: number; // Percentage of completion (0-100)
  startDate: Date;
  completionDate?: Date;
  abandonedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdoptionSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ritual: {
      type: Schema.Types.ObjectId,
      ref: "Ritual",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AdoptionStatus),
      default: AdoptionStatus.ACTIVE,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    abandonedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient queries
AdoptionSchema.index({ user: 1, ritual: 1 }, { unique: true });
AdoptionSchema.index({ ritual: 1, status: 1 });
AdoptionSchema.index({ user: 1, status: 1 });
AdoptionSchema.index({ startDate: -1 });

export default mongoose.model<IAdoption>("Adoption", AdoptionSchema);
