import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';
import { useBookingStore } from '@/store/useBookingStore';
import { BookingModal } from './BookingModal';
import { Calendar as CalendarIcon, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { bookings, addBooking, updateBooking, deleteBooking } = useBookingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('timeGridWeek');
  const [newBookingId, setNewBookingId] = useState<string | null>(null);

  // Handle date selection
  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setIsModalOpen(true);
  };

  // Handle event drop (move)
  const handleEventDrop = (dropInfo: any) => {
    updateBooking(dropInfo.event.id, {
      start: dropInfo.event.start,
      end: dropInfo.event.end,
    });
  };

  // Handle event resize
  const handleEventResize = (resizeInfo: any) => {
    updateBooking(resizeInfo.event.id, {
      start: resizeInfo.event.start,
      end: resizeInfo.event.end,
    });
  };

  // Handle event click (delete)
  const handleEventClick = (clickInfo: any) => {
    if (confirm(`Delete booking for ${clickInfo.event.title}?`)) {
      deleteBooking(clickInfo.event.id);
    }
  };

  // Handle booking submission
  const handleBookingSubmit = (data: {
    name: string;
    start: Date;
    end: Date;
  }) => {
    const newBooking = {
      title: `${data.name}'s Meeting`,
      name: data.name,
      start: data.start,
      end: data.end,
    };
    addBooking(newBooking);
    
    // Trigger shimmer animation for new booking
    setTimeout(() => {
      const lastBooking = bookings[bookings.length - 1];
      if (lastBooking) {
        setNewBookingId(lastBooking.id);
        setTimeout(() => setNewBookingId(null), 2000);
      }
    }, 100);
  };

  // Convert bookings to FullCalendar events
  const events = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    start: booking.start,
    end: booking.end,
    backgroundColor: booking.id === newBookingId ? 'transparent' : 'hsl(188 95% 50% / 0.2)',
    borderColor: 'hsl(188 95% 50%)',
    textColor: 'hsl(210 40% 98%)',
    classNames: booking.id === newBookingId ? ['new-booking'] : [],
  }));

  useEffect(() => {
    // Custom styling for FullCalendar
    const style = document.createElement('style');
    style.textContent = `
      .fc {
        font-family: inherit;
      }
      .fc .fc-toolbar-title {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, hsl(240 60% 40%), hsl(188 95% 50%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .fc .fc-button {
        background: hsl(220 20% 15% / 0.7) !important;
        border: 1px solid hsl(210 40% 98% / 0.1) !important;
        color: hsl(210 40% 98%) !important;
        padding: 0.5rem 1rem;
        transition: all 0.2s;
      }
      .fc .fc-button:hover {
        background: hsl(220 20% 20% / 0.8) !important;
        box-shadow: 0 0 20px hsl(188 95% 50% / 0.3);
      }
      .fc .fc-button-active {
        background: linear-gradient(135deg, hsl(240 60% 40%), hsl(188 95% 50%)) !important;
      }
      .fc .fc-col-header-cell {
        background: hsl(220 20% 15% / 0.5);
        border-color: hsl(220 15% 25%);
        color: hsl(188 95% 50%);
        font-weight: 600;
        padding: 0.75rem;
      }
      .fc .fc-daygrid-day,
      .fc .fc-timegrid-slot {
        border-color: hsl(220 15% 25%);
      }
      .fc .fc-daygrid-day:hover,
      .fc .fc-timegrid-slot:hover {
        background: hsl(220 20% 15% / 0.5);
      }
      .fc .fc-event {
        border-radius: 0.5rem;
        padding: 0.25rem 0.5rem;
        transition: all 0.2s;
        cursor: pointer;
      }
      .fc .fc-event:hover {
        box-shadow: 0 0 20px hsl(188 95% 50% / 0.6);
        transform: scale(1.02);
      }
      .fc .fc-event.new-booking {
        background: linear-gradient(90deg, 
          hsl(188 95% 50% / 0.2), 
          hsl(188 95% 50% / 0.5), 
          hsl(188 95% 50% / 0.2)
        ) !important;
        background-size: 200% 100% !important;
        animation: shimmer 2s linear infinite;
        box-shadow: 0 0 20px hsl(188 95% 50% / 0.8);
      }
      .fc .fc-day-today {
        background: hsl(188 95% 50% / 0.05) !important;
      }
      .fc .fc-daygrid-day-number,
      .fc .fc-timegrid-slot-label {
        color: hsl(210 40% 98%);
      }
      .fc .fc-scrollgrid {
        border-color: hsl(220 15% 25%);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
                Meeting Room Booking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} scheduled
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setView('timeGridWeek')}
              variant={view === 'timeGridWeek' ? 'default' : 'outline'}
              size="sm"
              className={view === 'timeGridWeek' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Grid className="h-4 w-4 mr-2" />
              Week
            </Button>
            <Button
              onClick={() => setView('dayGridMonth')}
              variant={view === 'dayGridMonth' ? 'default' : 'outline'}
              size="sm"
              className={view === 'dayGridMonth' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
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
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            validRange={{
              start: new Date(),
              end: '2030-12-31',
            }}
          />
        </div>
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleBookingSubmit}
        initialStart={selectedSlot?.start}
        initialEnd={selectedSlot?.end}
      />
    </div>
  );
};
