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
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAppContext, Job, Application } from '../contexts/AppContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';



export function EmployerJobManagement() {
  const { currentUser } = useAppContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Handle job selection
  const handleSelectJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId) || null;
    setSelectedJob(job);
  };

  useEffect(() => {
    if (!currentUser) return;

    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, where('employerId', '==', currentUser.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobList);
    }, (err) => {
      console.error("Error fetching jobs:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'completed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'reviewed':
        return 'outline';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeJobs = filteredJobs.filter(job => job.status === 'active');
  const draftJobs = filteredJobs.filter(job => job.status === 'draft');
  const completedJobs = filteredJobs.filter(job => job.status === 'completed');

  if (selectedJob) {
    const job = selectedJob;
    const [applications, setApplications] = useState<Application[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);

    const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
      const appDocRef = doc(db, 'applications', applicationId);
      try {
        await updateDoc(appDocRef, { status });
      } catch (error) {
        console.error("Error updating application status:", error);
      }
    };

    useEffect(() => {
      setApplicationsLoading(true);
      const appsCollection = collection(db, 'applications');
      const q = query(appsCollection, where('jobId', '==', job.id));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setApplications(appList);
        setApplicationsLoading(false);
      });

      return () => unsubscribe();
    }, [job.id]);

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
              ← Back
            </Button>
            <div className="flex-1">
              <h1 className="text-lg">{job.title}</h1>
              <p className="text-sm text-muted-foreground">{job.applicants?.length || 0} applications</p>
            </div>
            <Badge variant={getStatusColor(job.status) as any}>
              {job.status}
            </Badge>
          </div>
        </div>

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {applicationsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              applications.map((application, index) =>
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">{application.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-sm">{application.studentName}</h3>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>Applied {(application.appliedAt as any).toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getApplicationStatusColor(application.status) as any}>
                        {application.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, 'accepted')}>Accept Application</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(application.id, 'rejected')}>Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg mb-4">Job Management</h1>
        
        <div className="flex space-x-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({draftJobs.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <JobList 
              jobs={activeJobs} 
              onSelectJob={handleSelectJob}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            <JobList 
              jobs={draftJobs} 
              onSelectJob={handleSelectJob}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <JobList 
              jobs={completedJobs} 
              onSelectJob={handleSelectJob}
              getStatusColor={getStatusColor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface JobListProps {
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
  getStatusColor: (status: string) => string;
}

function JobList({ jobs, onSelectJob, getStatusColor }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-center">
        <div>
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No jobs found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-3">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm">{job.title}</h3>
                  {job.isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(job.status) as any}>
                    {job.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectJob(job.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job
                      </DropdownMenuItem>
                      {job.status === 'active' ? (
                        <DropdownMenuItem>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause Job
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Activate Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${job.hourlyRate}/hr
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.duration}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {job.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{job.applicants?.length || 0} applications</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Posted {(job.createdAt as any)?.toDate().toLocaleDateString()}</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs"
                    onClick={() => onSelectJob(job.id)}
                  >
                    View Details →
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}