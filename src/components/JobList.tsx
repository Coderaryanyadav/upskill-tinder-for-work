import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  increment as firestoreIncrement,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { JobWithApplication } from './JobCard';

export type { JobWithApplication };
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Heart, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Search,
  Filter,
  Loader2,
  RefreshCw,
  ChevronUp
} from 'lucide-react';

// Types
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  isRemote: boolean;
  postedAt: any;
  createdBy: string;
  applications: number;
  bookmarks: number;
  saved?: boolean;
  applied?: boolean;
}

interface JobListState {
  jobs: Job[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  lastDoc: any;
  searchQuery: string;
  activeTab: 'all' | 'saved' | 'applied';
  filters: {
    jobType: string[];
    experienceLevel: string[];
    location: string;
    remoteOnly: boolean;
  };
}

// Job Card Component
const JobCard: React.FC<{ 
  job: Job; 
  onSave: (jobId: string) => void;
  onApply: (jobId: string) => void;
  saving?: boolean;
  applying?: boolean;
}> = ({ job, onSave, onApply, saving, applying }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {job.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Building className="w-4 h-4" />
                <span>{job.company}</span>
                <MapPin className="w-4 h-4 ml-2" />
                <span>{job.location}</span>
                {job.isRemote && (
                  <Badge variant="secondary" className="ml-2">Remote</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(job.postedAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave(job.id)}
              disabled={saving}
              className={`${job.saved ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            >
              <Heart className={`w-5 h-5 ${job.saved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{job.jobType}</Badge>
            <Badge variant="outline">{job.experienceLevel}</Badge>
            {job.requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {req}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {job.applications} applications • {job.bookmarks} saved
            </div>
            <Button
              onClick={() => onApply(job.id)}
              disabled={applying || job.applied}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {applying ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {job.applied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main JobList Component
const JobList: React.FC = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<JobListState>({
    jobs: [],
    loading: true,
    loadingMore: false,
    hasMore: true,
    lastDoc: null,
    searchQuery: '',
    activeTab: 'all',
    filters: {
      jobType: [],
      experienceLevel: [],
      location: '',
      remoteOnly: false
    }
  });
  const [savingJobs, setSavingJobs] = useState<Set<string>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());

  // Fetch jobs from Firestore
  const fetchJobs = useCallback(async (isLoadMore = false) => {
    if (!currentUser) return;

    try {
      setState(prev => ({ 
        ...prev, 
        loading: !isLoadMore, 
        loadingMore: isLoadMore 
      }));

      let jobQuery = query(
        collection(db, 'jobs'),
        orderBy('postedAt', 'desc'),
        limit(10)
      );

      if (isLoadMore && state.lastDoc) {
        jobQuery = query(
          collection(db, 'jobs'),
          orderBy('postedAt', 'desc'),
          startAfter(state.lastDoc),
          limit(10)
        );
      }

      const snapshot = await getDocs(jobQuery);
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      // Get user's saved and applied jobs
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', currentUser.uid)
      ));
      
      const userData = userDoc.docs[0]?.data();
      const savedJobs = userData?.savedJobs || [];
      const appliedJobs = userData?.appliedJobs || [];

      // Mark jobs as saved/applied
      const jobsWithStatus = jobs.map(job => ({
        ...job,
        saved: savedJobs.includes(job.id),
        applied: appliedJobs.includes(job.id)
      }));

      setState(prev => ({
        ...prev,
        jobs: isLoadMore ? [...prev.jobs, ...jobsWithStatus] : jobsWithStatus,
        loading: false,
        loadingMore: false,
        hasMore: jobs.length === 10,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      setState(prev => ({ ...prev, loading: false, loadingMore: false }));
    }
  }, [currentUser, state.lastDoc]);

  // Save/unsave job
  const handleSaveJob = useCallback(async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to save jobs');
      return;
    }

    setSavingJobs(prev => new Set(prev).add(jobId));

    try {
      const job = state.jobs.find(j => j.id === jobId);
      const userRef = doc(db, 'users', currentUser.uid);
      const jobRef = doc(db, 'jobs', jobId);

      if (job?.saved) {
        // Remove from saved
        await updateDoc(userRef, {
          savedJobs: arrayRemove(jobId),
          updatedAt: serverTimestamp()
        });
        await updateDoc(jobRef, {
          bookmarks: firestoreIncrement(-1)
        });
      } else {
        // Add to saved
        await updateDoc(userRef, {
          savedJobs: arrayUnion(jobId),
          updatedAt: serverTimestamp()
        });
        await updateDoc(jobRef, {
          bookmarks: firestoreIncrement(1)
        });
      }

      // Update local state
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => 
          j.id === jobId ? { ...j, saved: !j.saved } : j
        )
      }));

      toast.success(job?.saved ? 'Job removed from saved' : 'Job saved!');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setSavingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  }, [currentUser, state.jobs]);

  // Apply to job
  const handleApplyJob = useCallback(async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to apply');
      return;
    }

    setApplyingJobs(prev => new Set(prev).add(jobId));

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const jobRef = doc(db, 'jobs', jobId);

      // Add to applied jobs
      await updateDoc(userRef, {
        appliedJobs: arrayUnion(jobId),
        updatedAt: serverTimestamp()
      });
      
      // Increment applications count
      await updateDoc(jobRef, {
        applications: firestoreIncrement(1)
      });

      // Update local state
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => 
          j.id === jobId ? { ...j, applied: true, applications: j.applications + 1 } : j
        )
      }));

      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to apply to job');
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  }, [currentUser]);

  // Filter jobs based on active tab and search
  const filteredJobs = useMemo(() => {
    let filtered = state.jobs;

    // Apply tab filter
    if (state.activeTab === 'saved') {
      filtered = filtered.filter(job => job.saved);
    } else if (state.activeTab === 'applied') {
      filtered = filtered.filter(job => job.applied);
    }

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [state.jobs, state.activeTab, state.searchQuery]);

  // Load initial jobs
  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser, fetchJobs]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
        && state.hasMore && !state.loading && !state.loadingMore
      ) {
        fetchJobs(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchJobs, state.hasMore, state.loading, state.loadingMore]);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please sign in to view jobs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
        <Button
          variant="outline"
          onClick={() => fetchJobs()}
          disabled={state.loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs 
        value={state.activeTab} 
        onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value as any }))}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
        </TabsList>

        <TabsContent value={state.activeTab} className="space-y-4">
          {state.loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  onApply={handleApplyJob}
                  saving={savingJobs.has(job.id)}
                  applying={applyingJobs.has(job.id)}
                />
              ))}
            </AnimatePresence>
          )}

          {state.loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Back to top button */}
      {filteredJobs.length > 5 && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default JobList;
export { JobList };
