import mongoose from 'mongoose';

export enum UserType {
  Staff = 0,
  Administrator = 1
};

export interface UserModel {
  username: string,
  password: string,
  full_name: string,
  email: string,
  creation_date: Date,
  birth_date: Date,
  type: UserType,
  _id: mongoose.Types.ObjectId
};

export const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  full_name: String,
  email: String,
  creation_date: Date,
  birth_date: Date,
  type: Number
});

export const userModel = mongoose.model ('user', userSchema);

