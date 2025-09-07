import { motion } from "framer-motion";
import { X, MapPin, Clock, Calendar, Star, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  distance: number;
  hourlyRate: number;
  duration: string;
  category: string;
  skills: string[];
  description: string;
  requirements: string[];
  image: string;
  isUrgent?: boolean;
}

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}

export function JobDetailsModal({ job, onClose, onApply }: JobDetailsModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Job image */}
          <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
            <div className="absolute inset-0 bg-black/20" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
            {job.isUrgent && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                Urgent Hiring
              </Badge>
            )}
          </div>

          {/* Job header info */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-xl mb-1">{job.title}</h1>
                <div className="flex items-center text-muted-foreground mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{job.company}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-primary mb-1">${job.hourlyRate}</div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  {job.distance > 0 ? `${job.distance}km away` : 'Remote'}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm">{job.duration}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-sm">Flexible</div>
              </div>
            </div>

            {/* Category and skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{job.category}</Badge>
              {job.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-6 pb-6 max-h-64 overflow-y-auto space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-3">Job Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Company info */}
          <div>
            <h3 className="mb-3">About {job.company}</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{job.company}</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-muted-foreground ml-1">4.8</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">124 reviews</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A growing company focused on providing excellent service and maintaining a positive work environment.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-border bg-card">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Not Interested
            </Button>
            <Button onClick={onApply} className="flex-1">
              Apply Now
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}