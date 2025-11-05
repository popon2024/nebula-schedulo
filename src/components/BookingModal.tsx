"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, User, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { Booking } from "@/store/useBookingStore";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
  initialStart?: Date;
  initialEnd?: Date;
  initialPurpose?: string;
  initialPIC?: string;
  isEditMode?: boolean;
  data: any;
  fetchBookings: () => void;
  onSubmit?: (data: {
    purpose: string;
    startTime: Date;
    endTime: Date;
    pic: string;
  }) => void;
}

// Helper untuk konversi Date → input lokal
function toLocalInputValue(date?: Date) {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export const BookingModal = ({
  isOpen,
  onClose,
  initialId,
  initialStart,
  initialEnd,
  initialPurpose,
  initialPIC,
  isEditMode = false,
  onSubmit,
  data,
  fetchBookings,
}: BookingModalProps) => {
  const [purpose, setPurpose] = useState(initialPurpose || "");
  const [pic, setPic] = useState(initialPIC || "");
  const [startDate, setStartDate] = useState(toLocalInputValue(initialStart));
  const [endDate, setEndDate] = useState(toLocalInputValue(initialEnd));
  const [loading, setLoading] = useState(false);

  // 🔹 Error state untuk field start & end
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPurpose(initialPurpose || "");
      setPic(initialPIC || "");
      setStartDate(toLocalInputValue(initialStart));
      setEndDate(toLocalInputValue(initialEnd));
      setStartError("");
      setEndError("");
    }
  }, [isOpen, initialPurpose, initialPIC, initialStart, initialEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setStartError("");
    setEndError("");

    if (!purpose || !pic || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validasi end setelah start
    if (end <= start) {
      setStartError("Start time must be before end time");
      setEndError("End time must be after start time");
      return;
    }

    // Validasi bentrok dengan data lain
    const conflictBooking = data.find((booking: Booking) => {
      const existingStart = new Date(booking.start);
      const existingEnd = new Date(booking.end);

      // Abaikan booking yang sedang diedit
      if (isEditMode && booking.id === initialId) return false;

      return start < existingEnd && end > existingStart;
    });

    if (conflictBooking) {
      setStartError("Selected time conflicts with another booking");
      setEndError("Selected time conflicts with another booking");
      return;
    }

    // Submit
    const payload = { purpose, pic, startTime: start, endTime: end };
    onSubmit?.(payload);
  };

  const handleDelete = async () => {
    if (!initialId) return;
    if (!confirm("Are you sure you want to delete this booking?")) return;

    setLoading(true);
    try {
      await apiRequest(`/bookings/${initialId}`, "DELETE");
      fetchBookings?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  {isEditMode ? "Edit Booking" : "Book a Meeting"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isEditMode
                    ? "Update your meeting details"
                    : "Schedule your meeting purpose and time"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="flex items-center gap-2 text-foreground">
                    <NotebookPen className="h-4 w-4 text-secondary" />
                    Purpose
                  </Label>
                  <Input
                    id="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter meeting purpose"
                    required
                  />
                </div>

                {/* PIC */}
                <div className="space-y-2">
                  <Label htmlFor="pic" className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-secondary" />
                    PIC (Person in Charge)
                  </Label>
                  <Input
                    id="pic"
                    type="text"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    placeholder="Enter responsible person"
                    required
                  />
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <Label htmlFor="start" className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-secondary" />
                    Start Time
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max="2030-12-31T23:59"
                    required
                    className={startError ? "border-destructive" : ""}
                  />
                  {startError && <p className="text-destructive text-sm">{startError}</p>}
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <Label htmlFor="end" className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-secondary" />
                    End Time
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max="2030-12-31T23:59"
                    required
                    className={endError ? "border-destructive" : ""}
                  />
                  {endError && <p className="text-destructive text-sm">{endError}</p>}
                </div>

                <div className="flex gap-3">
                  {isEditMode && (
                    <Button
                      type="button"
                      onClick={handleDelete}
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground py-6"
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : isEditMode
                      ? "Update Booking"
                      : "Create Booking"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
