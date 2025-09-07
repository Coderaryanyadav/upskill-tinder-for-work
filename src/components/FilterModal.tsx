import { useState } from 'react';
import { motion } from "framer-motion";
import { X, MapPin, DollarSign, Clock, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

export interface FilterOptions {
  radius: number;
  minPay: number;
  maxPay: number;
  categories: string[];
  urgentOnly: boolean;
  remoteWork: boolean;
  duration: string[];
}

const categories = [
  'Food Service', 'Retail', 'Pet Care', 'Education', 'Events',
  'Marketing', 'Delivery', 'Cleaning', 'Tech Support', 'Other'
];

const durations = ['1-2 hours', '3-4 hours', '5-8 hours', 'Full day', 'Multi-day'];

export function FilterModal({ open, onClose, onApplyFilters, initialFilters }: FilterModalProps) {
  const [radius, setRadius] = useState([initialFilters.radius || 10]);
  const [payRange, setPayRange] = useState([initialFilters.minPay || 15, initialFilters.maxPay || 30]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories || []);
  const [urgentOnly, setUrgentOnly] = useState(initialFilters.urgentOnly || false);
  const [remoteWork, setRemoteWork] = useState(initialFilters.remoteWork || false);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(initialFilters.duration || []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleDuration = (duration: string) => {
    setSelectedDurations(prev =>
      prev.includes(duration)
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
  };

  const handleApply = () => {
    const filters: FilterOptions = {
      radius: radius[0],
      minPay: payRange[0],
      maxPay: payRange[1],
      categories: selectedCategories,
      urgentOnly,
      remoteWork,
      duration: selectedDurations
    };
    onApplyFilters(filters);
  };

  const clearFilters = () => {
    setRadius([10]);
    setPayRange([15, 30]);
    setSelectedCategories([]);
    setUrgentOnly(false);
    setRemoteWork(false);
    setSelectedDurations([]);
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <h2 className="text-lg">Filters</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-6">
          {/* Distance */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>Distance: {radius[0]}km</span>
            </div>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>

          <Separator />

          {/* Pay Range */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>Pay: ${payRange[0]} - ${payRange[1]}/hour</span>
            </div>
            <Slider
              value={payRange}
              onValueChange={setPayRange}
              max={50}
              min={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>$10</span>
              <span>$50+</span>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <h3 className="mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Duration */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Duration</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {durations.map((duration) => (
                <Badge
                  key={duration}
                  variant={selectedDurations.includes(duration) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleDuration(duration)}
                >
                  {duration}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Urgent jobs only</span>
              <Switch checked={urgentOnly} onCheckedChange={setUrgentOnly} />
            </div>
            <div className="flex items-center justify-between">
              <span>Include remote work</span>
              <Switch checked={remoteWork} onCheckedChange={setRemoteWork} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-border bg-card">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}