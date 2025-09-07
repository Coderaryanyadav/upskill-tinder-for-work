import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Search, X, Filter, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

type JobStatus = 'applied' | 'interview' | 'rejected' | 'offered';
type StatusFilter = JobStatus | 'all';

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  activeTab: 'all-jobs' | 'my-applications';
  onTabChange: (value: 'all-jobs' | 'my-applications') => void;
  onResetFilters: () => void;
  filters: {
    experience: string[];
    jobType: string[];
    salaryRange: [number, number];
    remoteOnly: boolean;
  };
  onFilterChange: (filters: {
    experience?: string[];
    jobType?: string[];
    salaryRange?: [number, number];
    remoteOnly?: boolean;
  }) => void;
}

const experienceLevels = [
  { id: 'entry', label: 'Entry Level' },
  { id: 'mid', label: 'Mid Level' },
  { id: 'senior', label: 'Senior' },
  { id: 'lead', label: 'Lead/Manager' },
];

const jobTypes = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const JobFilters: React.FC<JobFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeTab,
  onTabChange,
  onResetFilters,
  filters,
  onFilterChange,
}) => {
  const hasActiveFilters = 
    filters.experience.length > 0 ||
    filters.jobType.length > 0 ||
    filters.salaryRange[0] > 0 ||
    filters.salaryRange[1] < 200000 ||
    filters.remoteOnly;

  const handleExperienceChange = (level: string) => {
    const newExperience = filters.experience.includes(level)
      ? filters.experience.filter(item => item !== level)
      : [...filters.experience, level];
    onFilterChange({ experience: newExperience });
  };

  const handleJobTypeChange = (type: string) => {
    const newJobTypes = filters.jobType.includes(type)
      ? filters.jobType.filter(item => item !== type)
      : [...filters.jobType, type];
    onFilterChange({ jobType: newJobTypes });
  };

  const handleSalaryChange = (value: number[]) => {
    onFilterChange({ salaryRange: value as [number, number] });
  };

  const handleRemoteOnlyChange = (checked: boolean) => {
    onFilterChange({ remoteOnly: checked });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-9 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => onTabChange(value as 'all-jobs' | 'my-applications')}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
            <TabsTrigger value="my-applications">My Applications</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Status and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'my-applications' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All Applications</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onResetFilters}
                    className="text-xs text-muted-foreground h-6 px-2"
                  >
                    Reset all
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remote-only" 
                      checked={filters.remoteOnly}
                      onCheckedChange={handleRemoteOnlyChange}
                    />
                    <Label htmlFor="remote-only" className="text-sm">Remote only</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Experience Level</Label>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <div key={level.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`exp-${level.id}`}
                          checked={filters.experience.includes(level.id)}
                          onCheckedChange={() => handleExperienceChange(level.id)}
                        />
                        <Label htmlFor={`exp-${level.id}`} className="text-sm">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Job Type</Label>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type.id}`}
                          checked={filters.jobType.includes(type.id)}
                          onCheckedChange={() => handleJobTypeChange(type.id)}
                        />
                        <Label htmlFor={`type-${type.id}`} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Salary Range</Label>
                    <span className="text-xs text-muted-foreground">
                      ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={200000}
                    step={5000}
                    value={filters.salaryRange}
                    onValueChange={handleSalaryChange}
                    minStepsBetweenThumbs={1}
                    className="py-4"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filters.remoteOnly && <span className="inline-flex items-center mr-2"><MapPin className="h-3 w-3 mr-1" /> Remote</span>}
          {filters.jobType.length > 0 && <span className="inline-flex items-center mr-2"><Briefcase className="h-3 w-3 mr-1" /> {filters.jobType.join(', ')}</span>}
          {filters.salaryRange[0] > 0 && <span className="inline-flex items-center"><DollarSign className="h-3 w-3 mr-1" /> ${filters.salaryRange[0].toLocaleString()}+</span>}
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
