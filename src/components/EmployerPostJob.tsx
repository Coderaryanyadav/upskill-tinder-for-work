import { useState } from 'react';
// Remove unused motion import
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Plus,
  X,
  CheckCircle,
  Eye,
  Send,
  Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useAppContext } from '../contexts/AppContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface JobFormData {
  title: string;
  description: string;
  hourlyRate: string;
  location: string;
  duration: string;
  startTime: string;
  category: string;
  skills: string[];
  isUrgent: boolean;
  requirements: string[];
}

export function EmployerPostJob() {
  const { currentUser } = useAppContext();
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    hourlyRate: '',
    location: '',
    duration: '',
    startTime: '',
    category: '',
    skills: [],
    isUrgent: false,
    requirements: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'Food Service', 'Retail', 'Pet Care', 'Education', 'Events',
    'Marketing', 'Delivery', 'Cleaning', 'Tech Support', 'Other'
  ];

  const durations = ['1-2 hours', '3-4 hours', '5-8 hours', 'Full day', 'Multi-day'];

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }));
  };

  const validateForm = (): string | undefined => {
    if (!currentUser) return 'You must be logged in to post a job.';
    if (!formData.title.trim()) return 'Job title is required.';
    if (!formData.description.trim()) return 'Job description is required.';
    if (!formData.hourlyRate) return 'Hourly rate is required.';
    if (isNaN(parseFloat(formData.hourlyRate)) || parseFloat(formData.hourlyRate) <= 0) 
      return 'Please enter a valid hourly rate.';
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.duration) return 'Duration is required.';
    if (!formData.category) return 'Category is required.';
    if (formData.skills.length === 0) return 'Please add at least one required skill.';
    return undefined;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentUser) {
      console.error('No user logged in');
      setFormError('You must be logged in to post a job');
      return;
    }
    
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...formData,
        company: currentUser.company || currentUser.name || 'Unknown Company',
        employerId: currentUser.id,
        status: 'active',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicants: [],
        applications: 0,
        views: 0
      };
      
      await addDoc(collection(db, 'jobs'), jobData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        hourlyRate: '',
        location: '',
        duration: '',
        startTime: '',
        category: '',
        skills: [],
        isUrgent: false,
        requirements: []
      });
      
      setIsSubmitted(true);
      setFormError(null);
    } catch (error: unknown) {
      console.error('Error posting job:', error);
      let errorMessage = 'Failed to post job. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'permission-denied') {
          errorMessage = 'You do not have permission to post jobs.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Job Posted Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your job listing has been created and is now visible to job seekers.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Post Another Job
          </Button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="h-full overflow-y-auto">
        {/* Preview Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              ← Back to Edit
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={isSubmitting}
            >
              Back to Edit
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) {
                  const formEvent = new Event('submit', { cancelable: true });
                  form.dispatchEvent(formEvent);
                }
              }}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Job Preview */}
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            {/* Job image placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
              <div className="absolute inset-0 bg-black/20" />
              {formData.isUrgent && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                  Urgent
                </Badge>
              )}
            </div>

            {/* Job details */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg mb-1">{formData.title || 'Job Title'}</h3>
                <p className="text-sm text-muted-foreground">{currentUser?.company || currentUser?.name || 'Your Company'}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formData.location || 'Location'}
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${formData.hourlyRate || '0'}/hr
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formData.duration || 'Duration'}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.category && (
                  <Badge variant="secondary">{formData.category}</Badge>
                )}
                {formData.skills.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {formData.skills.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{formData.skills.length - 2}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {formData.description || 'Job description will appear here...'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg">Post New Job</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <Card className="p-4">
          <h3 className="mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Barista, Dog Walker, Event Assistant"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job duties, work environment, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>
          </div>
        </Card>

        {/* Compensation & Schedule */}
        <Card className="p-4">
          <h3 className="mb-4">Compensation & Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="18"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="pl-10"
                  min="0"
                  step="0.50"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Downtown, 123 Main St"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Label htmlFor="urgent">Mark as urgent</Label>
            <Switch
              id="urgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked }))}
            />
          </div>
        </Card>

        {/* Skills Required */}
        <Card className="p-4">
          <h3 className="mb-4">Required Skills</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="cursor-pointer">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-4">
          <h3 className="mb-4">Job Requirements</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a requirement..."
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.requirements.length > 0 && (
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{requirement}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(requirement)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Submit */}
        {formError && (
          <div className="text-center text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {formError}
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="button" variant="outline" className="flex-1">
            Save as Draft
          </Button>
          <Button type="submit" className="flex-1">
            Post Job
          </Button>
        </div>
      </form>
    </div>
  );
}