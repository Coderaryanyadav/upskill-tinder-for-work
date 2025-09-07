import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { User, Edit, Star, MapPin, Award, Camera, Mail, Phone, Calendar, Briefcase, Settings, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAppContext } from '../contexts/AppContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export function ProfileScreen() {
    const { currentUser } = useAppContext();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                    setProfile({ id: userDoc.id, ...userDoc.data() });
                }
                else {
                    // If no profile exists, create a basic one from auth data
                    const basicProfile = {
                        id: currentUser.id,
                        name: currentUser.name,
                        email: currentUser.email,
                        type: currentUser.type,
                    };
                    setProfile(basicProfile);
                }
                setError(null);
            }
            catch (err) {
                console.error("Error fetching profile:", err);
                setError('Failed to load profile.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser]);
    if (loading) {
        return _jsx("div", { className: "h-full flex items-center justify-center", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin" }) });
    }
    if (error || !profile) {
        return _jsx("div", { className: "h-full flex items-center justify-center text-destructive", children: error || 'Profile not found.' });
    }
    if (profile.type === 'student') {
        return _jsx(StudentProfile, { profile: profile, isEditing: isEditing, setIsEditing: setIsEditing });
    }
    return _jsx(EmployerProfile, { profile: profile, isEditing: isEditing, setIsEditing: setIsEditing });
}
function StudentProfile({ profile, isEditing, setIsEditing }) {
    const [formData, setFormData] = useState({
        ...profile,
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [newSkill, setNewSkill] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
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
    const validateForm = () => {
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
        if (!validateForm())
            return;
        try {
            setIsSaving(true);
            setSaveError(null);
            const userDocRef = doc(db, 'users', profile.id);
            await setDoc(userDocRef, {
                ...formData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            setIsEditing(false);
        }
        catch (error) {
            console.error("Error updating profile:", error);
            setSaveError('Failed to update profile. Please try again.');
        }
        finally {
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
    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: (prev.skills || []).filter(skill => skill !== skillToRemove)
        }));
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
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
        }
        catch (error) {
            console.error('Error uploading image:', error);
            setSaveError('Failed to upload image');
        }
        finally {
            setIsUploading(false);
        }
    };
    return (_jsxs("div", { className: "container mx-auto p-4 max-w-4xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("h1", { className: "text-2xl font-bold", children: "My Profile" }), !isEditing ? (_jsxs(Button, { onClick: () => setIsEditing(true), variant: "outline", children: [_jsx(Edit, { className: "w-4 h-4 mr-2" }), "Edit Profile"] })) : (_jsxs("div", { className: "space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                    setFormData(profile);
                                    setSaveError(null);
                                    setIsEditing(false);
                                }, disabled: isSaving, children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] })) : 'Save Changes' })] }))] }), saveError && (_jsx("div", { className: "mb-6 p-4 bg-destructive/10 text-destructive rounded-lg", children: saveError })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsxs("div", { className: "relative mb-4", children: [_jsxs(Avatar, { className: "w-32 h-32", children: [_jsx(AvatarFallback, { children: (formData.name || 'U').charAt(0).toUpperCase() }), formData.photoURL && (_jsx("img", { src: formData.photoURL, alt: formData.name || 'Profile', className: "w-full h-full object-cover" }))] }), isEditing && (_jsxs(Button, { variant: "outline", size: "icon", className: "absolute -bottom-2 -right-2 rounded-full h-10 w-10", onClick: () => fileInputRef.current?.click(), disabled: isUploading, children: [isUploading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsx(Camera, { className: "w-4 h-4" })), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, accept: "image/*", className: "hidden", disabled: isUploading })] }))] }), isEditing ? (_jsx(Input, { value: formData.name || '', onChange: (e) => setFormData(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                })), className: "text-xl font-semibold text-center mb-1", placeholder: "Your name" })) : (_jsx("h2", { className: "text-xl font-semibold", children: formData.name })), isEditing ? (_jsx(Input, { value: formData.title || '', onChange: (e) => setFormData(prev => ({
                                                    ...prev,
                                                    title: e.target.value
                                                })), className: "text-muted-foreground text-center", placeholder: "Job title" })) : (formData.title && _jsx("p", { className: "text-muted-foreground", children: formData.title }))] }), _jsxs("div", { className: "mt-6 pt-6 border-t", children: [_jsx("h3", { className: "font-medium mb-3", children: "Contact Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx("span", { className: "text-sm truncate", children: formData.email })] }), isEditing ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx(Input, { value: formData.phone || '', onChange: (e) => setFormData(prev => ({
                                                                            ...prev,
                                                                            phone: e.target.value
                                                                        })), placeholder: "Phone number", className: "h-8" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx(Input, { value: formData.location || '', onChange: (e) => setFormData(prev => ({
                                                                            ...prev,
                                                                            location: e.target.value
                                                                        })), placeholder: "Location", className: "h-8" })] })] })) : (_jsxs(_Fragment, { children: [formData.phone && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx("span", { className: "text-sm", children: formData.phone })] })), formData.location && (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-sm", children: formData.location })] }))] }))] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-medium", children: "Skills" }), isEditing && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => document.getElementById('add-skill-input')?.focus(), children: "Add" }))] }), isEditing ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "add-skill-input", value: newSkill, onChange: (e) => setNewSkill(e.target.value), placeholder: "Add a skill", className: "h-8 flex-1", onKeyDown: (e) => e.key === 'Enter' && handleAddSkill() }), _jsx(Button, { type: "button", size: "sm", onClick: handleAddSkill, disabled: !newSkill.trim(), children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: formData.skills?.map((skill) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center group", children: [skill, _jsx("button", { type: "button", onClick: () => handleRemoveSkill(skill), className: "ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground", children: "\u00D7" })] }, skill))) })] })) : (_jsx("div", { className: "flex flex-wrap gap-2", children: formData.skills?.length ? (formData.skills.map((skill) => (_jsx(Badge, { variant: "secondary", children: skill }, skill)))) : (_jsx("p", { className: "text-sm text-muted-foreground", children: isEditing ? 'Start adding your skills' : 'No skills added yet' })) }))] })] }), _jsxs("div", { className: "md:col-span-2 space-y-6", children: [_jsxs(Card, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "About Me" }), isEditing ? (_jsxs("div", { className: "space-y-4", children: [_jsx(Textarea, { value: formData.bio || '', onChange: (e) => setFormData(prev => ({
                                                    ...prev,
                                                    bio: e.target.value
                                                })), placeholder: "Tell us about yourself, your experience, and what you're looking for in a job...", rows: 5, className: "min-h-[120px]" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "This will be visible to employers. Write a compelling summary of who you are and what you bring to the table." })] })) : (_jsx("p", { className: "text-muted-foreground whitespace-pre-line", children: formData.bio || 'No bio added yet. Add a bio to help employers get to know you better.' }))] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Work Experience" }), isEditing && (_jsx(Button, { variant: "ghost", size: "sm", children: "+ Add Experience" }))] }), formData.experience?.length ? (_jsx("div", { className: "space-y-6", children: formData.experience.map((exp, index) => (_jsxs("div", { className: "border-l-2 border-primary pl-4 py-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: exp.title }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [exp.company, exp.location && ` • ${exp.location}`] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [exp.startDate, " - ", exp.endDate || 'Present', exp.employmentType && ` • ${exp.employmentType}`] })] }), isEditing && (_jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", children: _jsx(Edit, { className: "w-3 h-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", children: _jsx(X, { className: "w-3 h-3" }) })] }))] }), exp.description && (_jsx("div", { className: "mt-2 text-sm text-muted-foreground", children: exp.description.split('\n').map((line, i) => (_jsx("p", { className: "mt-1", children: line }, i))) })), exp.skills && exp.skills.length > 0 && (_jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: exp.skills.map((skill, i) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: skill }, i))) }))] }, index))) })) : (_jsxs("div", { className: "text-center py-8 border-2 border-dashed rounded-lg", children: [_jsx("div", { className: "w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx(Briefcase, { className: "w-5 h-5 text-muted-foreground" }) }), _jsx("h4", { className: "font-medium", children: "Add your work experience" }), _jsx("p", { className: "text-sm text-muted-foreground max-w-xs mx-auto mt-1", children: "Showcase your professional background and previous roles to help employers understand your experience." }), isEditing && (_jsx(Button, { variant: "outline", size: "sm", className: "mt-3", children: "+ Add Experience" }))] }))] })] })] })] }));
    return (_jsx("div", { className: "h-full overflow-y-auto", children: _jsxs(Tabs, { defaultValue: "profile", className: "h-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "profile", children: "Profile" }), _jsx(TabsTrigger, { value: "reviews", children: "Reviews" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "profile", className: "p-6 space-y-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "text-center", children: [_jsxs("div", { className: "relative inline-block mb-4", children: [_jsx(Avatar, { className: "w-24 h-24", children: _jsx(AvatarFallback, { className: "text-2xl", children: profile.name.charAt(0) }) }), _jsx(Button, { size: "sm", className: "absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0", children: _jsx(Camera, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex items-center justify-center space-x-2 mb-2", children: isEditing ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsx(Button, { size: "sm", onClick: handleSave, children: "Save" })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [_jsx("h1", { className: "text-2xl", children: profile.name }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsEditing(true), children: _jsx(Edit, { className: "w-4 h-4" }) })] })) }), isEditing ? (_jsx(Textarea, { value: formData.bio, onChange: (e) => setFormData({ ...formData, bio: e.target.value }) })) : (_jsx("p", { className: "text-muted-foreground", children: profile.bio || 'Student' })), _jsxs("div", { className: "flex items-center justify-center space-x-4 mt-3 text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-4 h-4 mr-1" }), isEditing ? (_jsx(Input, { value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }) })) : (profile.location || 'Location not set')] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-4 h-4 mr-1" }), "Joined Dec 2024"] })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl", children: "12" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Jobs Completed" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx("span", { className: "text-2xl", children: "4.8" }), _jsx(Star, { className: "w-5 h-5 text-yellow-500 fill-current" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Average Rating" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl", children: "$347" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Total Earned" })] })] }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Award, { className: "w-5 h-5 text-yellow-500" }), _jsx("span", { children: "Worker Level" })] }), _jsx(Badge, { variant: "secondary", children: "Bronze" })] }), _jsx(Progress, { value: 53, className: "mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Complete 7 more jobs to reach Silver level" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsxs(Card, { className: "p-4", children: [_jsx("h3", { className: "mb-3", children: "Skills" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [displaySkills.map((skill) => (_jsx(Badge, { variant: "outline", children: skill }, skill))), _jsx(Button, { variant: "outline", size: "sm", className: "h-6 text-xs", children: "+ Add Skill" })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { className: "p-4", children: [_jsx("h3", { className: "mb-3", children: "Contact Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: profile.email })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground" }), isEditing ? (_jsx(Input, { value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) })) : (_jsx("span", { className: "text-sm", children: profile.phone || 'Phone not set' }))] })] })] }) })] }), _jsxs(TabsContent, { value: "reviews", className: "p-6 space-y-4", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [_jsx("span", { className: "text-3xl", children: "4.8" }), _jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: "w-5 h-5 text-yellow-500 fill-current" }, star))) })] }), _jsx("p", { className: "text-muted-foreground", children: "Based on 12 reviews" })] }), recentReviews.map((review, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, children: _jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", children: review.job }), _jsx("p", { className: "text-xs text-muted-foreground", children: review.company })] }), _jsx("div", { className: "flex items-center space-x-1", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}` }, i))) })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: review.review }), _jsx("p", { className: "text-xs text-muted-foreground", children: review.date })] }) }, review.id)))] }), _jsxs(TabsContent, { value: "settings", className: "p-6 space-y-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("h3", { className: "mb-4", children: "Notification Preferences" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Job matches" }), _jsx(Button, { variant: "outline", size: "sm", children: "Edit" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Application updates" }), _jsx(Button, { variant: "outline", size: "sm", children: "Edit" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "New messages" }), _jsx(Button, { variant: "outline", size: "sm", children: "Edit" })] })] })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h3", { className: "mb-4", children: "Account" }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Privacy Settings"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(User, { className: "w-4 h-4 mr-2" }), "Edit Profile"] }), _jsx(Button, { variant: "destructive", className: "w-full justify-start", children: "Delete Account" })] })] })] })] }) }));
}
function EmployerProfile({ profile, isEditing, setIsEditing }) {
    const [formData, setFormData] = useState(profile);
    const handleSave = async () => {
        try {
            const userDocRef = doc(db, 'users', profile.id);
            await setDoc(userDocRef, { ...formData }, { merge: true });
            setIsEditing(false);
        }
        catch (error) {
            console.error("Error updating profile:", error);
        }
    };
    return (_jsxs("div", { className: "h-full overflow-y-auto p-6 space-y-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "text-center", children: [_jsxs("div", { className: "relative inline-block mb-4", children: [_jsx(Avatar, { className: "w-24 h-24", children: _jsx(AvatarFallback, { className: "text-2xl", children: profile.name.charAt(0) }) }), _jsx(Button, { size: "sm", className: "absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0", children: _jsx(Camera, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex items-center justify-center space-x-2 mb-2", children: isEditing ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsx(Button, { size: "sm", onClick: handleSave, children: "Save" })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [_jsx("h1", { className: "text-2xl", children: profile.name }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsEditing(true), children: _jsx(Edit, { className: "w-4 h-4" }) })] })) }), isEditing ? (_jsx(Textarea, { value: formData.bio, onChange: (e) => setFormData({ ...formData, bio: e.target.value }) })) : (_jsx("p", { className: "text-muted-foreground", children: profile.bio || 'Employer' }))] }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl", children: "8" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Active Jobs" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx("span", { className: "text-2xl", children: "4.9" }), _jsx(Star, { className: "w-5 h-5 text-yellow-500 fill-current" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Company Rating" })] })] }) }), _jsxs(Card, { className: "p-4", children: [_jsx("h3", { className: "mb-3", children: "Company Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(MapPin, { className: "w-4 h-4 text-muted-foreground" }), isEditing ? (_jsx(Input, { value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }) })) : (_jsx("span", { className: "text-sm", children: profile.location || 'Location not set' }))] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Mail, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: profile.email })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Phone, { className: "w-4 h-4 text-muted-foreground" }), isEditing ? (_jsx(Input, { value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) })) : (_jsx("span", { className: "text-sm", children: profile.phone || 'Phone not set' }))] })] })] })] }));
}
