import mongoose, { Schema, Document } from 'mongoose'
export interface IUser extends Document {
  username: string; email: string; password: string
  country?: string; avatar?: string; isPro: boolean; createdAt: Date
  stats: { totalTests: number; bestWpm: number; avgWpm: number; avgAcc: number; streak: number; lastActive: Date }
}
const S = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  country: String, avatar: String, isPro: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  stats: {
    totalTests: { type: Number, default: 0 }, bestWpm: { type: Number, default: 0 },
    avgWpm: { type: Number, default: 0 }, avgAcc: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }, lastActive: { type: Date, default: Date.now },
  }
})
export const User = mongoose.models.User || mongoose.model<IUser>('User', S)
