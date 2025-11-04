import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    start: Date;
    end: Date;
  }) => void;
  initialStart?: Date;
  initialEnd?: Date;
}

export const BookingModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialStart,
  initialEnd,
}: BookingModalProps) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(
    initialStart?.toISOString().slice(0, 16) || ''
  );
  const [endDate, setEndDate] = useState(
    initialEnd?.toISOString().slice(0, 16) || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    onSubmit({
      name,
      start: new Date(startDate),
      end: new Date(endDate),
    });

    setName('');
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  Book Meeting Room
                </h2>
                <p className="text-muted-foreground text-sm">
                  Schedule your meeting with ease
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start" className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-secondary" />
                    Start Time
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max="2030-12-31T23:59"
                    className="bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end" className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    End Time
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max="2030-12-31T23:59"
                    className="bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6"
                >
                  Create Booking
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
