import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { JobWithApplication } from './JobCard';
import EnhancedJobCard from './EnhancedJobCard';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Star,
  Zap,
  Target,
  Award,
  ChevronUp,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { toast } from 'react-hot-toast';
// import AdvancedJobFilters from './AdvancedJobFilters';

// Enhanced interfaces for production
interface JobListState {
  jobs: JobWithApplication[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  lastDoc: any;
  searchQuery: string;
  activeTab: string;
  filters: JobFilters;
  error: string | null;
  totalJobs: number;
  appliedJobs: number;
  savedJobs: number;
  viewMode: 'grid' | 'list';
  sortBy: 'recent' | 'salary' | 'relevance' | 'distance';
}

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

interface JobStats {
  totalViews: number;
  totalApplications: number;
  successRate: number;
  averageSalary: number;
  topSkills: string[];
  trendingCompanies: string[];
}

const ITEMS_PER_PAGE = 12;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Production-ready JobList Component
const ProductionJobList: React.FC = () => {
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
    },
    error: null,
    totalJobs: 0,
    appliedJobs: 0,
    savedJobs: 0,
    viewMode: 'grid',
    sortBy: 'recent'
  });

  const [stats, setStats] = useState<JobStats>({
    totalViews: 0,
    totalApplications: 0,
    successRate: 0,
    averageSalary: 0,
    topSkills: [],
    trendingCompanies: []
  });

  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [cache, setCache] = useState<Map<string, { data: JobWithApplication[], timestamp: number }>>(new Map());
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadMoreInView] = useInView({ threshold: 0.1 });
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced job fetching with caching and real-time updates
  const fetchJobs = useCallback(async (isLoadMore = false, useCache = true) => {
    if (!currentUser?.uid) return;

    const cacheKey = `${state.activeTab}-${state.searchQuery}-${JSON.stringify(state.filters)}-${state.sortBy}`;
    
    // Check cache first
    if (useCache && !isLoadMore) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setState(prev => ({
          ...prev,
          jobs: cached.data,
          loading: false,
          error: null
        }));
        return;
      }
    }

    try {
      setState(prev => ({ 
        ...prev, 
        loading: !isLoadMore, 
        loadingMore: isLoadMore,
        error: null 
      }));

      let jobQuery = query(collection(db, 'jobs'));

      // Enhanced filtering
      if (state.activeTab !== 'all') {
        if (state.activeTab === 'applied') {
          jobQuery = query(jobQuery, where('applicants', 'array-contains', currentUser.uid));
        } else if (state.activeTab === 'saved') {
          jobQuery = query(jobQuery, where('savedBy', 'array-contains', currentUser.uid));
        } else if (state.activeTab === 'remote') {
          jobQuery = query(jobQuery, where('remote', '==', true));
        } else if (state.activeTab === 'trending') {
          jobQuery = query(jobQuery, where('trending', '==', true));
        }
      }

      // Apply filters
      if (state.filters.remote) {
        jobQuery = query(jobQuery, where('remote', '==', true));
      }
      
      if (state.filters.jobType.length > 0) {
        jobQuery = query(jobQuery, where('type', 'in', state.filters.jobType));
      }

      if (state.filters.location.length > 0) {
        jobQuery = query(jobQuery, where('location', 'in', state.filters.location));
      }

      // Enhanced sorting
      switch (state.sortBy) {
        case 'recent':
          jobQuery = query(jobQuery, orderBy('postedAt', 'desc'));
          break;
        case 'salary':
          jobQuery = query(jobQuery, orderBy('salaryMax', 'desc'));
          break;
        case 'relevance':
          jobQuery = query(jobQuery, orderBy('relevanceScore', 'desc'));
          break;
        case 'distance':
          jobQuery = query(jobQuery, orderBy('distance', 'asc'));
          break;
      }

      if (isLoadMore && state.lastDoc) {
        jobQuery = query(jobQuery, startAfter(state.lastDoc));
      }

      jobQuery = query(jobQuery, limit(ITEMS_PER_PAGE));

      const snapshot = await getDocs(jobQuery);
      const newJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hasApplied: doc.data().applicants?.includes(currentUser.uid) || false,
        saved: doc.data().savedBy?.includes(currentUser.uid) || false,
        applicationStatus: doc.data().applicationStatuses?.[currentUser.uid] || 'applied'
      })) as JobWithApplication[];

      // Apply client-side search if needed
      const filteredJobs = state.searchQuery 
        ? newJobs.filter(job => 
            job.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            job.skills?.some(skill => skill.toLowerCase().includes(state.searchQuery.toLowerCase()))
          )
        : newJobs;

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === ITEMS_PER_PAGE;

      setState(prev => ({
        ...prev,
        jobs: isLoadMore ? [...prev.jobs, ...filteredJobs] : filteredJobs,
        loading: false,
        loadingMore: false,
        lastDoc: lastVisible,
        hasMore,
        error: null
      }));

      // Update cache
      if (!isLoadMore) {
        setCache(prev => new Map(prev.set(cacheKey, {
          data: filteredJobs,
          timestamp: Date.now()
        })));
      }

      // Fetch stats
      await fetchJobStats();

    } catch (error) {
      console.error('Error fetching jobs:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: 'Failed to load jobs. Please try again.'
      }));
      
      // Retry mechanism
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        fetchJobs(isLoadMore, false);
      }, 3000);
    }
  }, [currentUser, state.activeTab, state.searchQuery, state.filters, state.sortBy, cache]);

  // Fetch job statistics
  const fetchJobStats = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const userApplicationsQuery = query(
        collection(db, 'applications'),
        where('userId', '==', currentUser.uid)
      );
      const applicationsSnapshot = await getDocs(userApplicationsQuery);
      
      const userStatsDoc = await getDocs(query(
        collection(db, 'userStats'),
        where('userId', '==', currentUser.uid)
      ));

      const applications = applicationsSnapshot.docs.map(doc => doc.data());
      const userStats = userStatsDoc.docs[0]?.data();

      setStats({
        totalViews: userStats?.totalViews || 0,
        totalApplications: applications.length,
        successRate: applications.length > 0 
          ? (applications.filter(app => app.status === 'offered').length / applications.length) * 100 
          : 0,
        averageSalary: userStats?.averageSalary || 0,
        topSkills: userStats?.topSkills || [],
        trendingCompanies: userStats?.trendingCompanies || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [currentUser]);

  // Real-time updates
  useEffect(() => {
    if (!realtimeUpdates || !currentUser?.uid) return;

    const jobsRef = collection(db, 'jobs');
    let realtimeQuery = query(jobsRef, orderBy('postedAt', 'desc'), limit(50));

    unsubscribeRef.current = onSnapshot(realtimeQuery, (snapshot) => {
      const changes = snapshot.docChanges();
      if (changes.length > 0) {
        setState(prev => {
          let updatedJobs = [...prev.jobs];
          
          changes.forEach(change => {
            const jobData = {
              id: change.doc.id,
              ...change.doc.data(),
              hasApplied: change.doc.data().applicants?.includes(currentUser.uid) || false,
              saved: change.doc.data().savedBy?.includes(currentUser.uid) || false,
            } as JobWithApplication;

            if (change.type === 'added') {
              updatedJobs.unshift(jobData);
            } else if (change.type === 'modified') {
              const index = updatedJobs.findIndex(job => job.id === jobData.id);
              if (index !== -1) {
                updatedJobs[index] = jobData;
              }
            } else if (change.type === 'removed') {
              updatedJobs = updatedJobs.filter(job => job.id !== jobData.id);
            }
          });

          return { ...prev, jobs: updatedJobs };
        });
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUser, realtimeUpdates]);

  // Enhanced job application with optimistic updates
  const handleApply = useCallback(async (jobId: string) => {
    if (!currentUser?.uid || applyingId) return;

    setApplyingId(jobId);
    
    // Optimistic update
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === jobId 
          ? { ...job, hasApplied: true, applicants: (job.applicants || 0) + 1 }
          : job
      )
    }));

    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        applicants: arrayUnion(currentUser.uid),
        applicantCount: firestoreIncrement(1),
        [`applicationStatuses.${currentUser.uid}`]: 'applied'
      });

      // Create application record
      await updateDoc(doc(db, 'applications', `${currentUser.uid}_${jobId}`), {
        userId: currentUser.uid,
        jobId,
        appliedAt: serverTimestamp(),
        status: 'applied',
        resumeUrl: (currentUser as any).resumeUrl || '',
        coverLetter: ''
      });

      toast.success('Application submitted successfully!', {
        icon: '🎉',
        duration: 4000,
      });

    } catch (error) {
      console.error('Error applying to job:', error);
      
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(job => 
          job.id === jobId 
            ? { ...job, hasApplied: false, applicants: Math.max((job.applicants || 1) - 1, 0) }
            : job
        )
      }));

      toast.error('Failed to submit application. Please try again.');
    } finally {
      setApplyingId(null);
    }
  }, [currentUser, applyingId]);

  // Enhanced job saving with optimistic updates
  const handleSave = useCallback(async (jobId: string) => {
    if (!currentUser?.uid) return;

    const job = state.jobs.find(j => j.id === jobId);
    const isSaved = job?.saved;

    // Optimistic update
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === jobId ? { ...job, saved: !isSaved } : job
      )
    }));

    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        savedBy: isSaved ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });

      toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully!', {
        icon: isSaved ? '💔' : '❤️',
      });

    } catch (error) {
      console.error('Error saving job:', error);
      
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(job => 
          job.id === jobId ? { ...job, saved: isSaved } : job
        )
      }));

      toast.error('Failed to save job. Please try again.');
    }
  }, [currentUser, state.jobs]);

  // Load more jobs when scrolling
  useEffect(() => {
    if (loadMoreInView && state.hasMore && !state.loading && !state.loadingMore) {
      fetchJobs(true);
    }
  }, [loadMoreInView, state.hasMore, state.loading, state.loadingMore, fetchJobs]);

  // Initial load and dependency changes
  useEffect(() => {
    fetchJobs();
  }, [state.activeTab, state.searchQuery, state.filters, state.sortBy]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoized filtered and sorted jobs
  const processedJobs = useMemo(() => {
    return state.jobs.filter(job => {
      if (state.activeTab === 'applied') return job.hasApplied;
      if (state.activeTab === 'saved') return job.saved;
      if (state.activeTab === 'remote') return job.remote;
      return true;
    });
  }, [state.jobs, state.activeTab]);

  // Enhanced stats cards
  const StatsCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs flex items-center gap-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
    </div>
  );

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-gray-600">{state.error}</p>
          <Button onClick={() => fetchJobs(false, false)} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Enhanced Header with Stats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Job Opportunities
            </h1>
            <p className="text-gray-600">Discover your next career move</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealtimeUpdates(!realtimeUpdates)}
              className={realtimeUpdates ? 'bg-green-50 border-green-200' : ''}
            >
              <Zap className={`w-4 h-4 mr-2 ${realtimeUpdates ? 'text-green-600' : ''}`} />
              Real-time {realtimeUpdates ? 'On' : 'Off'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }))}
            >
              {state.viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Briefcase}
            title="Total Applications"
            value={stats.totalApplications}
            change={12}
            color="#3b82f6"
          />
          <StatsCard
            icon={Target}
            title="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
            change={5}
            color="#10b981"
          />
          <StatsCard
            icon={DollarSign}
            title="Avg. Salary"
            value={`$${(stats.averageSalary / 1000).toFixed(0)}k`}
            change={8}
            color="#f59e0b"
          />
          <StatsCard
            icon={Award}
            title="Profile Views"
            value={stats.totalViews}
            change={15}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 pr-4 py-2 text-base"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Advanced Filters
            </Button>
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Most Relevant</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              All Jobs
              <Badge variant="secondary" className="ml-1">{state.totalJobs}</Badge>
            </TabsTrigger>
            <TabsTrigger value="remote" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Remote
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="applied" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Applied
              <Badge variant="secondary" className="ml-1">{state.appliedJobs}</Badge>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Saved
              <Badge variant="secondary" className="ml-1">{state.savedJobs}</Badge>
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              For You
            </TabsTrigger>
          </TabsList>

          <TabsContent value={state.activeTab} className="mt-6">
            {state.loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading amazing opportunities..." variant="glow" />
              </div>
            ) : processedJobs.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
                <Button onClick={() => setState(prev => ({ ...prev, searchQuery: '', filters: { ...prev.filters, location: [], jobType: [], skills: [] } }))}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${state.viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode="popLayout">
                  {processedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <EnhancedJobCard
                        job={job}
                        onApply={handleApply}
                        onSave={handleSave}
                        applyingId={applyingId}
                        onViewDetails={(jobId) => {
                          console.log('View details for job:', jobId);
                        }}
                        variant={state.viewMode === 'list' ? 'compact' : 'default'}
                        showStats={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More */}
            {state.hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {state.loadingMore ? (
                  <LoadingSpinner text="Loading more jobs..." />
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => fetchJobs(true)}
                    className="hover:scale-105 transition-transform"
                  >
                    Load More Jobs
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="sm"
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionJobList;
export { ProductionJobList };
