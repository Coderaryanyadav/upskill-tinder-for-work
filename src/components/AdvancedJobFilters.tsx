import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Users, 
  Star,
  Zap,
  Building,
  GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface JobFilters {
  location: string[];
  jobType: string[];
  experience: string[];
  salary: [number, number];
  remote: boolean;
  skills: string[];
  company: string[];
  datePosted: string;
  companySize: string[];
  benefits: string[];
}

interface AdvancedJobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  jobCount?: number;
}

const AdvancedJobFilters: React.FC<AdvancedJobFiltersProps> = ({
  filters,
  onFiltersChange,
  jobCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const jobTypes = [
    'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary'
  ];

  const experienceLevels = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Director'
  ];

  const companySizes = [
    'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'
  ];

  const benefits = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401k', 
    'Flexible Hours', 'Remote Work', 'Paid Time Off', 'Stock Options',
    'Professional Development', 'Gym Membership', 'Free Meals', 'Commuter Benefits'
  ];

  const datePostedOptions = [
    { value: 'any', label: 'Any time' },
    { value: '24h', label: 'Past 24 hours' },
    { value: '3d', label: 'Past 3 days' },
    { value: '7d', label: 'Past week' },
    { value: '30d', label: 'Past month' }
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS',
    'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Redux',
    'Vue.js', 'Angular', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin'
  ];

  const topLocations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
    'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO',
    'Remote', 'Hybrid'
  ];

  const updateFilter = useCallback((key: keyof JobFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((key: keyof JobFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  }, [filters, updateFilter]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      location: [],
      jobType: [],
      experience: [],
      salary: [0, 200000],
      remote: false,
      skills: [],
      company: [],
      datePosted: 'any',
      companySize: [],
      benefits: []
    });
  }, [onFiltersChange]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location.length > 0) count++;
    if (filters.jobType.length > 0) count++;
    if (filters.experience.length > 0) count++;
    if (filters.salary[0] > 0 || filters.salary[1] < 200000) count++;
    if (filters.remote) count++;
    if (filters.skills.length > 0) count++;
    if (filters.company.length > 0) count++;
    if (filters.datePosted !== 'any') count++;
    if (filters.companySize.length > 0) count++;
    if (filters.benefits.length > 0) count++;
    return count;
  };

  const FilterSection = ({ title, icon: Icon, children, sectionKey }: any) => (
    <div className="space-y-3">
      <button
        onClick={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-medium">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: activeSection === sectionKey ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <X className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {activeSection === sectionKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Advanced Filters
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {jobCount} jobs
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {/* Location Filter */}
            <FilterSection title="Location" icon={MapPin} sectionKey="location">
              <div className="space-y-2">
                <Input
                  placeholder="Search locations..."
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {topLocations.map(location => (
                    <Badge
                      key={location}
                      variant={filters.location.includes(location) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleArrayFilter('location', location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={filters.remote}
                    onCheckedChange={(checked) => updateFilter('remote', checked)}
                  />
                  <Label htmlFor="remote" className="text-sm">Remote only</Label>
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* Job Type Filter */}
            <FilterSection title="Job Type" icon={Briefcase} sectionKey="jobType">
              <div className="grid grid-cols-2 gap-2">
                {jobTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={filters.jobType.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('jobType', type)}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator />

            {/* Experience Level */}
            <FilterSection title="Experience Level" icon={GraduationCap} sectionKey="experience">
              <div className="space-y-2">
                {experienceLevels.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={filters.experience.includes(level)}
                      onCheckedChange={() => toggleArrayFilter('experience', level)}
                    />
                    <Label htmlFor={level} className="text-sm">{level}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator />

            {/* Salary Range */}
            <FilterSection title="Salary Range" icon={DollarSign} sectionKey="salary">
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.salary}
                    onValueChange={(value) => updateFilter('salary', value as [number, number])}
                    max={200000}
                    min={0}
                    step={5000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.salary[0].toLocaleString()}</span>
                  <span>${filters.salary[1].toLocaleString()}</span>
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* Skills */}
            <FilterSection title="Skills" icon={Star} sectionKey="skills">
              <div className="space-y-2">
                <Input
                  placeholder="Search skills..."
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-1">
                  {popularSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant={filters.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleArrayFilter('skills', skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* Company Size */}
            <FilterSection title="Company Size" icon={Building} sectionKey="companySize">
              <div className="space-y-2">
                {companySizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={size}
                      checked={filters.companySize.includes(size)}
                      onCheckedChange={() => toggleArrayFilter('companySize', size)}
                    />
                    <Label htmlFor={size} className="text-sm">{size}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator />

            {/* Date Posted */}
            <FilterSection title="Date Posted" icon={Clock} sectionKey="datePosted">
              <div className="space-y-2">
                {datePostedOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={filters.datePosted === option.value}
                      onCheckedChange={() => updateFilter('datePosted', option.value)}
                    />
                    <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator />

            {/* Benefits */}
            <FilterSection title="Benefits" icon={Users} sectionKey="benefits">
              <div className="grid grid-cols-2 gap-2">
                {benefits.map(benefit => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={benefit}
                      checked={filters.benefits.includes(benefit)}
                      onCheckedChange={() => toggleArrayFilter('benefits', benefit)}
                    />
                    <Label htmlFor={benefit} className="text-sm text-xs">{benefit}</Label>
                  </div>
                ))}
              </div>
            </FilterSection>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedJobFilters;
