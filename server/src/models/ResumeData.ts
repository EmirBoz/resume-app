import mongoose, { Schema, Document } from 'mongoose';
import { ResumeData } from '../types';

export interface ResumeDataDocument extends Document {
  userId: mongoose.Types.ObjectId;
  personalInfo: {
    name: string;
    initials: string;
    location: string;
    locationLink: string;
    about: string;
    summary: string;
    avatarUrl: string;
    personalWebsiteUrl: string;
    email: string;
    tel: string;
  };
  work: Array<{
    id: string;
    company: string;
    link: string;
    badges: string[];
    title: string;
    start: string;
    end?: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    start?: string;
    end?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    title: string;
    techStack: string[];
    description: string;
    link?: {
      label: string;
      href: string;
    };
  }>;
  social: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const resumeDataSchema = new Schema<ResumeDataDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    name: { type: String, required: true },
    initials: { type: String, required: true },
    location: { type: String, required: true },
    locationLink: { type: String, required: true },
    about: { type: String, required: true },
    summary: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    personalWebsiteUrl: { type: String, required: true },
    email: { type: String, required: true },
    tel: { type: String, required: true }
  },
  work: [{
    id: { type: String, required: true },
    company: { type: String, required: true },
    link: { type: String, required: true },
    badges: [{ type: String }],
    title: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String },
    description: { type: String, required: true }
  }],
  education: [{
    id: { type: String, required: true },
    school: { type: String, required: true },
    degree: { type: String, required: true },
    start: { type: String },
    end: { type: String }
  }],
  skills: [{ type: String }],
  projects: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    techStack: [{ type: String }],
    description: { type: String, required: true },
    link: {
      label: { type: String },
      href: { type: String }
    }
  }],
  social: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export const ResumeDataModel = mongoose.model<ResumeDataDocument>('ResumeData', resumeDataSchema);