import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { 
  User, 
  Edit, 
  Star, 
  MapPin, 
  Award,
  Camera,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Settings,
  Loader2,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAppContext, UserProfile } from '../contexts/AppContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export function ProfileScreen() {
  const { currentUser } = useAppContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        setError('Not logged in.');
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
        } else {
          // If no profile exists, create a basic one from auth data
          const basicProfile: UserProfile = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            type: currentUser.type,
          };
          setProfile(basicProfile);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error || !profile) {
    return <div className="h-full flex items-center justify-center text-destructive">{error || 'Profile not found.'}</div>;
  }

  if (profile.type === 'student') {
    return <StudentProfile profile={profile} isEditing={isEditing} setIsEditing={setIsEditing} />;
  }
  return <EmployerProfile profile={profile} isEditing={isEditing} setIsEditing={setIsEditing} />;
}

function StudentProfile({ profile, isEditing, setIsEditing }: { profile: UserProfile; isEditing: boolean; setIsEditing: (editing: boolean) => void }) {
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    skills: profile.skills || [],
    education: profile.education || [],
    experience: profile.experience || []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sample data for demonstration
  const sampleSkills = ['Customer Service', 'Time Management', 'Communication', 'Problem Solving', 'Reliability'];
  const recentReviews = [
    {
      id: '1',
      job: 'Barista',
      company: 'Coffee Corner',
      rating: 5,
      review: 'Sarah was punctual, friendly, and learned our coffee preparation methods quickly. Great attitude!',
      date: '2025-01-15'
    },
    {
      id: '2',
      job: 'Dog Walker',
      company: 'Pet Paradise',
      rating: 4,
      review: 'Very responsible with our golden retriever. Sent updates and photos during the walk.',
      date: '2025-01-14'
    }
  ];
  
  // Use form data if available, otherwise use sample data
  const displaySkills = formData.skills?.length ? formData.skills : sampleSkills;

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setSaveError('Name is required');
      return false;
    }
    if (formData.skills?.length === 0) {
      setSaveError('Please add at least one skill');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const userDocRef = doc(db, 'users', profile.id);
      await setDoc(userDocRef, { 
        ...formData,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      // In a real app, upload to Firebase Storage here
      // const storageRef = ref(storage, `profile_pictures/${currentUser?.id}`);
      // const snapshot = await uploadBytes(storageRef, file);
      // const photoURL = await getDownloadURL(snapshot.ref);
      // 
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      const photoURL = URL.createObjectURL(file);
      
      setFormData(prev => ({ ...prev, photoURL }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setSaveError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setFormData(profile);
                setSaveError(null);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
      
      {saveError && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32">
                  <AvatarFallback>{(formData.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  {formData.photoURL && (
                    <img 
                      src={formData.photoURL} 
                      alt={formData.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </Avatar>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -bottom-2 -right-2 rounded-full h-10 w-10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="text-xl font-semibold text-center mb-1"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-xl font-semibold">{formData.name}</h2>
              )}
              
              {isEditing ? (
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="text-muted-foreground text-center"
                  placeholder="Job title"
                />
              ) : (
                formData.title && <p className="text-muted-foreground">{formData.title}</p>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{formData.email}</span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        placeholder="Phone number"
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: e.target.value
                        }))}
                        placeholder="Location"
                        className="h-8"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {formData.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formData.phone}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{formData.location}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Skills</h3>
              {isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => document.getElementById('add-skill-input')?.focus()}
                >
                  Add
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="add-skill-input"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="h-8 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills?.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="flex items-center group"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills?.length ? (
                  formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? 'Start adding your skills' : 'No skills added yet'}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">About Me</h3>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bio: e.target.value
                  }))}
                  placeholder="Tell us about yourself, your experience, and what you're looking for in a job..."
                  rows={5}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  This will be visible to employers. Write a compelling summary of who you are and what you bring to the table.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {formData.bio || 'No bio added yet. Add a bio to help employers get to know you better.'}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              {isEditing && (
                <Button variant="ghost" size="sm">
                  + Add Experience
                </Button>
              )}
            </div>
            
            {formData.experience?.length ? (
              <div className="space-y-6">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.endDate || 'Present'}
                          {exp.employmentType && ` • ${exp.employmentType}`}
                        </p>
                      </div>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {exp.description && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {exp.description.split('\n').map((line, i) => (
                          <p key={i} className="mt-1">{line}</p>
                        ))}
                      </div>
                    )}
                    
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {exp.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-medium">Add your work experience</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                  Showcase your professional background and previous roles to help employers understand your experience.
                </p>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-3">
                    + Add Experience
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <Tabs defaultValue="profile" className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h1 className="text-2xl">{profile.name}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {isEditing ? (
              <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            ) : (
              <p className="text-muted-foreground">{profile.bio || 'Student'}</p>
            )}
            <div className="flex items-center justify-center space-x-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {isEditing ? (
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                ) : (
                  profile.location || 'Location not set'
                )}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined Dec 2024
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl">12</p>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-2xl">4.8</span>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div>
                  <p className="text-2xl">$347</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Worker Level</span>
                </div>
                <Badge variant="secondary">Bronze</Badge>
              </div>
              <Progress value={53} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete 7 more jobs to reach Silver level
              </p>
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4">
              <h3 className="mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {displaySkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  + Add Skill
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4">
              <h3 className="mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <span className="text-sm">{profile.phone || 'Phone not set'}</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="reviews" className="p-6 space-y-4">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-3xl">4.8</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">Based on 12 reviews</p>
          </div>

          {recentReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm">{review.job}</p>
                    <p className="text-xs text-muted-foreground">{review.company}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{review.review}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="p-6 space-y-4">
          <Card className="p-4">
            <h3 className="mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Job matches</span>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Application updates</span>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New messages</span>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-4">Account</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmployerProfile({ profile, isEditing, setIsEditing }: { profile: UserProfile; isEditing: boolean; setIsEditing: (editing: boolean) => void }) {
  const [formData, setFormData] = useState(profile);

  const handleSave = async () => {
    try {
      const userDocRef = doc(db, 'users', profile.id);
      await setDoc(userDocRef, { ...formData }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative inline-block mb-4">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h1 className="text-2xl">{profile.name}</h1>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {isEditing ? (
          <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
        ) : (
          <p className="text-muted-foreground">{profile.bio || 'Employer'}</p>
        )}
      </motion.div>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl">8</p>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </div>
          <div>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl">4.9</span>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-sm text-muted-foreground">Company Rating</p>
          </div>
        </div>
      </Card>

      {/* Company Info */}
      <Card className="p-4">
        <h3 className="mb-3">Company Information</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {isEditing ? (
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            ) : (
              <span className="text-sm">{profile.location || 'Location not set'}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            {isEditing ? (
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            ) : (
              <span className="text-sm">{profile.phone || 'Phone not set'}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}