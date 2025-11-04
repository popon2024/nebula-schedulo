import { create } from 'zustand';

export interface Booking {
  id: string;
  title: string;
  name: string;
  start: Date;
  end: Date;
}

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  addBooking: (booking) =>
    set((state) => ({
      bookings: [
        ...state.bookings,
        {
          ...booking,
          id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      ],
    })),
  updateBooking: (id, updatedBooking) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updatedBooking } : b
      ),
    })),
  deleteBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),
}));
