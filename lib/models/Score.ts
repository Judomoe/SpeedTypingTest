import mongoose, { Schema, Document } from 'mongoose'
export interface IScore {
  userId: mongoose.Types.ObjectId; wpm: number; accuracy: number
  errorCount: number; duration: number; mode: string; language: string; createdAt: Date
}
const S = new Schema<IScore>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wpm: { type: Number, required: true }, accuracy: { type: Number, required: true },
  errorCount: { type: Number, default: 0 }, duration: { type: Number, required: true },
  mode: { type: String, default: 'words' }, language: { type: String, default: 'english' },
  createdAt: { type: Date, default: Date.now }
})
S.index({ userId: 1, createdAt: -1 })
S.index({ wpm: -1 })
export const Score = mongoose.models.Score || mongoose.model<IScore>('Score', S)
