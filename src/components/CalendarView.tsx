/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion } from "framer-motion";
import { BookingModal } from "./BookingModal";
import { Calendar as CalendarIcon, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDropArg } from "@fullcalendar/core/index.js";
import { apiRequest } from "@/lib/api";

/* ------------------------------------------------------------
 * 🗓️ CalendarView Component
 * ------------------------------------------------------------ */
interface Booking {
  id: string;
  purpose: string;
  start: Date;
  end: Date;
  pic: string;
}

export const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("timeGridWeek");
  const [newBookingId, setNewBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const API_URL = "/bookings";

  /* 🚀 Fetch all bookings */
  const fetchBookings = async () => {
    try {
      const data = await apiRequest(API_URL, "GET");
      if (Array.isArray(data)) {
        setBookings(
          data.map((b: any) => ({
            id: b.id.toString(),
            purpose: b.purpose,
            start: new Date(b.startTime),
            end: new Date(b.endTime),
            pic: b.pic || "",
          }))
        );
      }
    } catch (err) {
      console.error("❌ Failed to fetch bookings:", err);
    }
  };

  const onClose = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setEditingBooking(null);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ✨ Select date slot → open modal */
  const handleDateSelect = (selectInfo: { start: Date; end: Date }) => {
    setSelectedSlot(selectInfo);
    setIsModalOpen(true);
  };

  /* ✨ Create or update booking */
  const handleBookingSubmit = async (data: {
    purpose: string;
    startTime: Date;
    endTime: Date;
    pic: string;
  }) => {
    const payload = {
      purpose: data.purpose,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      pic: data.pic,
    };

    try {
      if (editingBooking) {
        await apiRequest(`${API_URL}/${editingBooking.id}`, "PUT", payload);
      } else {
        await apiRequest(API_URL, "POST", payload);
      }
      fetchBookings();
    } catch (err) {
      console.error("❌ Failed to save booking:", err);
    } finally {
      onClose();
    }
  };

  /* ✨ Drag/drop update */
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const id = dropInfo.event.id;
    const payload = {
      startTime: dropInfo.event.start?.toISOString(),
      endTime: dropInfo.event.end?.toISOString(),
    };

    // update local state instantly
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              start: new Date(payload.startTime!),
              end: new Date(payload.endTime!),
            }
          : b
      )
    );

    await apiRequest(`${API_URL}/${id}`, "PUT", payload);
  };

  /* ✨ Resize booking event */
  const handleEventResize = async (resizeInfo: any) => {
    const id = resizeInfo.event.id;
    const payload = {
      startTime: resizeInfo.event.start?.toISOString(),
      endTime: resizeInfo.event.end?.toISOString(),
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              start: new Date(payload.startTime!),
              end: new Date(payload.endTime!),
            }
          : b
      )
    );

    await apiRequest(`${API_URL}/${id}`, "PUT", payload);
  };

  /* ✨ Click event → edit */
  const handleEventClick = (clickInfo: any) => {
    const booking = bookings.find((b) => b.id === clickInfo.event.id);
    if (booking) {
      setEditingBooking({
        ...booking,
        start: new Date(booking.start),
        end: new Date(booking.end),
        purpose: booking.purpose || "",
        pic: booking.pic || "",
      });
      setIsModalOpen(true);
    }
  };

  /* ✨ Convert bookings → FullCalendar format */
  const events = bookings.map((b) => ({
    id: b.id,
    title: `${b.purpose} (${b.pic})`,
    start: b.start,
    end: b.end,
    backgroundColor: b.id === newBookingId ? "transparent" : "hsl(188 95% 90%)",
    borderColor: "hsl(188 95% 50%)",
    textColor: "hsl(222.2 84% 4.9%)",
  }));

  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary glow-primary">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
                IB-Room
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"} scheduled
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setView("timeGridWeek");
                calendarRef.current?.getApi().changeView("timeGridWeek");
              }}
              variant={view === "timeGridWeek" ? "default" : "outline"}
              size="sm"
              className={
                view === "timeGridWeek"
                  ? "bg-gradient-to-r from-primary to-secondary"
                  : ""
              }
            >
              <Grid className="h-4 w-4 mr-2" />
              Week
            </Button>
            <Button
              onClick={() => {
                setView("dayGridMonth");
                calendarRef.current?.getApi().changeView("dayGridMonth");
              }}
              variant={view === "dayGridMonth" ? "default" : "outline"}
              size="sm"
              className={
                view === "dayGridMonth"
                  ? "bg-gradient-to-r from-primary to-secondary"
                  : ""
              }
            >
              <List className="h-4 w-4 mr-2" />
              Month
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-xl overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            timeZone="local"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            editable
            selectable
            selectMirror
            dayMaxEvents
            weekends
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventResizableFromStart
            height="auto"
            slotDuration="00:30:00"
            snapDuration="00:30:00"
            validRange={{
              start: new Date(),
              end: "2030-12-31",
            }}
          />
        </div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        data={bookings}
        onClose={onClose}
        fetchBookings={fetchBookings}
        onSubmit={handleBookingSubmit}
        initialStart={editingBooking?.start || selectedSlot?.start}
        initialEnd={editingBooking?.end || selectedSlot?.end}
        initialId={editingBooking?.id}
        initialPurpose={editingBooking?.purpose}
        initialPIC={editingBooking?.pic}
        isEditMode={!!editingBooking}
      />
    </div>
  );
};
