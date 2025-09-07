import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Users, 
  Eye, 
  Edit, 
  Trash2,
  Play,
  Pause,
  DollarSign,
  MapPin,
  Clock,
  Loader2,
  Plus,
  Briefcase
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  employerId: string;
  status: 'active' | 'paused' | 'closed';
  applicants: number;
  views: number;
  postedAt: any;
  type: string;
  remote: boolean;
}

interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: any;
  resumeUrl?: string;
  coverLetter?: string;
}



export function EmployerJobManagement() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Handle job selection
  const handleSelectJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId) || null;
    setSelectedJob(job);
  };

  useEffect(() => {
    if (!currentUser) return;

    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, where('employerId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch applications for employer's jobs
  useEffect(() => {
    if (!currentUser || jobs.length === 0) return;

    const jobIds = jobs.map(job => job.id);
    const applicationsCollection = collection(db, 'applications');
    
    const fetchApplications = async () => {
      const applicationsQuery = query(applicationsCollection);
      const snapshot = await getDocs(applicationsQuery);
      const allApplications = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Application))
        .filter(app => jobIds.includes(app.jobId));
      setApplications(allApplications);
    };

    fetchApplications();
  }, [currentUser, jobs]);

  // Toggle job status
  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), { status });
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: status as any } : app
        )
      );
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  // Filter jobs based on search and tab
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && job.status === 'active';
    if (activeTab === 'paused') return matchesSearch && job.status === 'paused';
    if (activeTab === 'closed') return matchesSearch && job.status === 'closed';
    
    return matchesSearch;
  });

  // Get applications for selected job
  const getJobApplications = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Manage your posted jobs and applications</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'active').length}</p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({jobs.filter(j => j.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({jobs.filter(j => j.status === 'paused').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({jobs.filter(j => j.status === 'closed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No jobs match your search criteria.' : 'You haven\'t posted any jobs yet.'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => {
                const jobApplications = getJobApplications(job.id);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <p className="text-muted-foreground">{job.company}</p>
                            </div>
                            <Badge 
                              variant={job.status === 'active' ? 'default' : job.status === 'paused' ? 'secondary' : 'destructive'}
                            >
                              {job.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.postedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {jobApplications.length} applications
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {job.views || 0} views
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectJob(job.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Applications
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleJobStatus(job.id, job.status)}
                          >
                            {job.status === 'active' ? (
                              <><Pause className="w-4 h-4 mr-2" /> Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" /> Activate</>
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteJob(job.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Applications Modal/Panel for Selected Job */}
      {selectedJob && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Applications for "{selectedJob.title}"
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </Button>
          </div>
          
          <div className="space-y-4">
            {getJobApplications(selectedJob.id).map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">Application #{application.id.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">
                      Applied {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      application.status === 'pending' ? 'secondary' :
                      application.status === 'reviewed' ? 'default' :
                      application.status === 'shortlisted' ? 'default' :
                      application.status === 'hired' ? 'default' : 'destructive'
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
                
                {application.coverLetter && (
                  <p className="text-sm mb-3">{application.coverLetter}</p>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                  >
                    Mark Reviewed
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                  >
                    Shortlist
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            
            {getJobApplications(selectedJob.id).length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}