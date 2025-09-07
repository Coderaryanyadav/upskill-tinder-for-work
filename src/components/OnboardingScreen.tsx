import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap, Users, Star, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: <Zap className="w-16 h-16 text-primary" />,
    title: "Swipe to Find Work",
    description: "Discover job opportunities with a simple swipe. Right for interested, left to pass.",
    color: "from-blue-500 to-purple-600"
  },
  {
    icon: <Users className="w-16 h-16 text-primary" />,
    title: "Connect Instantly",
    description: "Match with employers and start conversations immediately when there's mutual interest.",
    color: "from-purple-600 to-pink-600"
  },
  {
    icon: <Star className="w-16 h-16 text-primary" />,
    title: "Build Your Reputation",
    description: "Complete jobs, earn reviews, and unlock better opportunities as you build your profile.",
    color: "from-pink-600 to-orange-600"
  },
  {
    icon: <MapPin className="w-16 h-16 text-primary" />,
    title: "Work Near You",
    description: "Find jobs in your area with smart location-based matching and flexible radius settings.",
    color: "from-orange-600 to-yellow-600"
  }
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${onboardingSteps[currentStep].color} opacity-10`} />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Progress bar */}
        <div className="p-6">
          <div className="w-full bg-muted rounded-full h-1">
            <motion.div
              className="bg-primary h-1 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="text-center max-w-sm"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mb-8 flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
              >
                {onboardingSteps[currentStep].icon}
              </motion.div>
              
              <motion.h2
                className="text-2xl mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {onboardingSteps[currentStep].title}
              </motion.h2>
              
              <motion.p
                className="text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {onboardingSteps[currentStep].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Dots indicator */}
          <div className="flex space-x-2">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}