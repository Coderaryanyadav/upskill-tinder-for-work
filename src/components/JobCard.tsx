import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, DollarSign, Clock, MapPin, Bookmark, CheckCircle, Clock as ClockIcon, XCircle } from 'lucide-react';
export interface JobWithApplication {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  type?: string;
  remote?: boolean;
  skills?: string[];
  postedAt?: any;
  applicants?: number;
  hasApplied?: boolean;
  applicationStatus?: 'applied' | 'interview' | 'offered' | 'rejected';
  saved?: boolean;
}
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobWithApplication;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  applyingId: string | null;
  onViewDetails: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = React.memo(({ 
  job, 
  onApply, 
  onSave, 
  applyingId,
  onViewDetails
}) => {
  const postedDate = useMemo(() => {
    return job.postedAt?.toDate 
      ? formatDistanceToNow(job.postedAt.toDate(), { addSuffix: true })
      : 'Recently';
  }, [job.postedAt]);

  const statusBadge = useMemo(() => {
    if (!job.hasApplied) return null;
    
    const statusConfig = {
      applied: { label: 'Applied', icon: <ClockIcon className="h-3 w-3 mr-1" />, variant: 'outline' as const },
      interview: { label: 'Interview', icon: <ClockIcon className="h-3 w-3 mr-1" />, variant: 'secondary' as const },
      offered: { label: 'Offered', icon: <CheckCircle className="h-3 w-3 mr-1" />, variant: 'secondary' as const },
      rejected: { label: 'Not Selected', icon: <XCircle className="h-3 w-3 mr-1" />, variant: 'destructive' as const },
    };

    const config = statusConfig[job.applicationStatus || 'applied' as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className="text-xs flex items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  }, [job.hasApplied, job.applicationStatus]);

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
              {job.remote && (
                <Badge variant="outline" className="text-xs">Remote</Badge>
              )}
            </div>
            <CardDescription className="text-sm">{job.company}</CardDescription>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSave(job.id);
            }}
            className="text-gray-400 hover:text-primary transition-colors"
            aria-label={job.saved ? 'Unsave job' : 'Save job'}
          >
            <Bookmark 
              className={`h-5 w-5 ${job.saved ? 'fill-primary text-primary' : ''}`} 
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              {job.salary}
            </div>
          )}
          {job.type && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.type}
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {postedDate}
          </div>
        </div>
        
        <p className="text-sm line-clamp-2 text-muted-foreground mb-3">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {job.skills?.slice(0, 4).map((skill: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(job.skills?.length || 0) > 4 && (
            <Badge variant="outline" className="text-xs">
              +{(job.skills?.length || 0) - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {job.applicants || 0} {job.applicants === 1 ? 'applicant' : 'applicants'}
          </Badge>
          {statusBadge}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(job.id)}
          >
            View Details
          </Button>
          {!job.hasApplied && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onApply(job.id)}
              disabled={!!applyingId}
            >
              {applyingId === job.id ? 'Applying...' : 'Apply Now'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
