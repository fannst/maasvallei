import mongoose, { mongo } from 'mongoose';

export enum ComplaintCategory {
    Sanitair = 0
}

export enum ComplaintPriority {
    ExtremelyHigh = 0,
    High = 1,
    Normal = 2,
    Low = 3
}

export enum ComplaintStatus {
    Open = 0,
    BeingHandled = 1,
    Handled = 2
}

export interface ComplaintModel {
    name: string,
    message: string,
    category: ComplaintCategory,
    priority: ComplaintPriority,
    claim: mongoose.Types.ObjectId,
    status: number,
    date: Date
}

export const complaintSchema = new mongoose.Schema ({
    name: String,
    message: String,
    category: Number,
    priority: Number,
    claim: mongoose.Types.ObjectId,
    status: Number,
    date: Date
});


export const complaintModel = mongoose.model ('complaint', complaintSchema);
