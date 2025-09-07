import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  Briefcase, 
  DollarSign, 
 
  MapPin, 
  Bookmark, 
  CheckCircle, 
  Clock as ClockIcon, 
  XCircle,
  Users,
  TrendingUp,
  Star,
  Eye,
  Share2,
  ExternalLink,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { JobWithApplication } from './JobCard';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface EnhancedJobCardProps {
  job: JobWithApplication;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  applyingId: string | null;
  onViewDetails: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  showStats?: boolean;
}

const EnhancedJobCard: React.FC<EnhancedJobCardProps> = React.memo(({ 
  job, 
  onApply, 
  onSave, 
  applyingId,
  onViewDetails,
  onShare,
  variant = 'default',
  showStats = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 500) + 50);

  const postedDate = useMemo(() => {
    return job.postedAt?.toDate 
      ? formatDistanceToNow(job.postedAt.toDate(), { addSuffix: true })
      : 'Recently';
  }, [job.postedAt]);

  const matchScore = useMemo(() => {
    // Calculate match score based on skills, location, etc.
    return Math.floor(Math.random() * 40) + 60; // Mock score 60-100%
  }, [job]);

  const urgencyLevel = useMemo(() => {
    const applicants = job.applicants || 0;
    if (applicants > 100) return 'high';
    if (applicants > 50) return 'medium';
    return 'low';
  }, [job.applicants]);

  const statusBadge = useMemo(() => {
    if (!job.hasApplied) return null;
    
    const statusConfig = {
      applied: { label: 'Applied', icon: <ClockIcon className="h-3 w-3 mr-1" />, variant: 'outline' as const, color: 'bg-blue-100 text-blue-700' },
      interview: { label: 'Interview', icon: <Users className="h-3 w-3 mr-1" />, variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-700' },
      offered: { label: 'Offered', icon: <CheckCircle className="h-3 w-3 mr-1" />, variant: 'secondary' as const, color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Not Selected', icon: <XCircle className="h-3 w-3 mr-1" />, variant: 'destructive' as const, color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[job.applicationStatus || 'applied' as keyof typeof statusConfig];
    return (
      <div className={`px-2 py-1 rounded-full text-xs flex items-center ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  }, [job.hasApplied, job.applicationStatus]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
    onShare?.(job.id);
  };

  const cardVariants = {
    default: "mb-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary",
    compact: "mb-3 hover:shadow-md transition-all duration-200",
    featured: "mb-6 hover:shadow-xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
  };


  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cardVariants.compact}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{job.title}</h3>
                  {job.remote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                  {(job as any).trending && <TrendingUp className="w-3 h-3 text-orange-500" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{job.company}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSave(job.id)}
                  className="p-1 h-auto"
                >
                  <Bookmark className={`w-3 h-3 ${job.saved ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApply(job.id)}
                  disabled={!!applyingId || job.hasApplied}
                  className="text-xs px-2 py-1"
                >
                  {job.hasApplied ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`${cardVariants[variant]} overflow-hidden relative group`}>
        {/* Urgency Indicator */}
        {urgencyLevel === 'high' && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-red-500 text-white text-xs animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          </div>
        )}

        {/* Match Score */}
        {showStats && matchScore > 80 && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-green-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" />
              {matchScore}% Match
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={(job as any).companyLogo || '/default-company.png'} alt={job.company} />
                  <AvatarFallback className="text-xs">
                    {job.company.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold leading-tight">{job.title}</CardTitle>
                  <CardDescription className="text-sm font-medium">{job.company}</CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {job.remote && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    Remote
                  </Badge>
                )}
                {(job as any).trending && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {(job as any).featured && (
                  <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                    <Award className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => onSave(job.id)}
                className="p-2"
                aria-label={job.saved ? 'Unsave job' : 'Save job'}
              >
                <Bookmark 
                  className={`w-4 h-4 transition-colors ${job.saved ? 'fill-primary text-primary' : 'hover:text-primary'}`} 
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
              </div>
              {job.salary && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salary}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {job.type && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {job.type}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {postedDate}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {job.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills?.slice(0, 5).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(job.skills?.length || 0) > 5 && (
              <Badge variant="outline" className="text-xs">
                +{(job.skills?.length || 0) - 5} more
              </Badge>
            )}
          </div>

          {/* Match Score Progress */}
          {showStats && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Match Score</span>
                <span className="text-xs font-medium">{matchScore}%</span>
              </div>
              <Progress value={matchScore} className="h-2" />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{job.applicants || 0} applicants</span>
            </div>
            {showStats && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{viewCount} views</span>
              </div>
            )}
            {statusBadge}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(job.id)}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Details
            </Button>
            {!job.hasApplied && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onApply(job.id)}
                  disabled={!!applyingId}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {applyingId === job.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 mr-1"
                      >
                        <Zap className="w-3 h-3" />
                      </motion.div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Apply Now
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </CardFooter>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
});

EnhancedJobCard.displayName = 'EnhancedJobCard';

export default EnhancedJobCard;
