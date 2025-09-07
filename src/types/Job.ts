export interface Salary {
  min: number;
  max: number;
  currency?: string;
  period?: 'hour' | 'week' | 'month' | 'year';
}

export type JobApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills?: string[];
  salary?: Salary;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';
  createdAt: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
  hasApplied?: boolean;
  applicationStatus?: JobApplicationStatus;
  applicationId?: string | null;
  status?: 'open' | 'closed' | 'draft';
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  category?: string;
  experienceLevel?: 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Manager' | 'Executive';
  educationLevel?: 'High School' | "Bachelor's" | "Master's" | 'PhD' | 'None';
  remote?: boolean;
  applicationDeadline?: string | Date;
  applicationUrl?: string;
  views?: number;
  applicationsCount?: number;
  companyLogo?: string;
  companyDescription?: string;
  companyWebsite?: string;
  contactEmail?: string;
  tags?: string[];
  isActive?: boolean;
  customFields?: Record<string, any>;
}
