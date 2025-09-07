import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Award,
  MapPin,
  Briefcase,
  Star
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useAppContext } from '../contexts/AppContext';

interface DashboardProps {
  userType: 'student' | 'employer';
}

export function Dashboard({ userType }: DashboardProps) {
  if (userType === 'student') {
    return <StudentDashboard />;
  }
  return <EmployerDashboard />;
}

function StudentDashboard() {
  const { currentUser } = useAppContext();
  
  const recentJobs = [
    {
      id: '1',
      title: 'Barista',
      company: 'Coffee Corner',
      date: '2025-01-15',
      earnings: 72,
      rating: 5,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Dog Walker',
      company: 'Pet Paradise',
      date: '2025-01-14',
      earnings: 45,
      rating: 4,
      status: 'completed'
    }
  ];
  
  // Recent jobs will be shown directly

  const upcomingJobs = [
    {
      id: '1',
      title: 'Tutoring Assistant',
      company: 'Learn & Grow',
      date: '2025-01-18',
      time: '2:00 PM',
      location: 'University District'
    },
    {
      id: '2',
      title: 'Social Media Content',
      company: 'TrendyBrand',
      date: '2025-01-20',
      time: '10:00 AM',
      location: 'Remote'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl mb-2">Hi, {currentUser?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-muted-foreground">Here's your work overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl">$347</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl">12</p>
                <p className="text-sm text-muted-foreground">Jobs completed</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl">4.8</p>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl">24h</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Progress to next level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Progress to Bronze Level</span>
            </div>
            <Badge variant="outline">8/15 jobs</Badge>
          </div>
          <Progress value={53} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Complete 7 more jobs to unlock better opportunities
          </p>
        </Card>
      </motion.div>

      {/* Upcoming Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Upcoming Jobs</h3>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{job.date}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{job.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {job.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-4">
          <h3 className="mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                  <p className="text-xs text-muted-foreground">{job.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">${job.earnings}</p>
                  {job.rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground ml-1">{job.rating}</span>
                    </div>
                  )}
                  <Badge 
                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function EmployerDashboard() {
  const stats = [
    { label: 'Active Jobs', value: '8', icon: Briefcase, color: 'blue' },
    { label: 'Applications', value: '24', icon: TrendingUp, color: 'green' },
    { label: 'Hired This Month', value: '12', icon: Star, color: 'yellow' },
    { label: 'Avg Response Time', value: '2h', icon: Clock, color: 'purple' }
  ];

  const recentJobs = [
    { id: '1', title: 'Barista', applications: 8, status: 'active' },
    { id: '2', title: 'Delivery Driver', applications: 15, status: 'active' },
    { id: '3', title: 'Event Staff', applications: 3, status: 'draft' }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl mb-2">Welcome back! 👋</h1>
        <p className="text-muted-foreground">Manage your job postings and applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4">
          <h3 className="mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-auto p-4 flex flex-col items-center space-y-2">
              <Briefcase className="w-6 h-6" />
              <span className="text-sm">Post New Job</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Star className="w-6 h-6" />
              <span className="text-sm">Review Applications</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4">
          <h3 className="mb-4">Recent Job Posts</h3>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.applications} applications</p>
                </div>
                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}