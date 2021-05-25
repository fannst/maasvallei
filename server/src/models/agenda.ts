import mongoose from 'mongoose';

export interface AgendaModel {
  userID: mongoose.Types.ObjectId,
  name: string,
  description: string,
  completed: boolean,
  time: Date,
  _id: mongoose.Types.ObjectId
}

export const agendaSchema = new mongoose.Schema ({
  userID: mongoose.Types.ObjectId,
  name: String,
  description: String,
  completed: Boolean,
  time: Date
});

export const agendaModel = mongoose.model ('agenda', agendaSchema);
