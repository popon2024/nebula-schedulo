import express from "express";
import prisma from "../prisma";

const router = express.Router();

// 🟢 GET all bookings
router.get("/", async (_req, res) => {
  try {
    const bookings = await prisma.bookingMeeting.findMany({
      include: { user: true },
    });
    res.json(bookings);
  } catch (err) {
    console.error("❌ Failed to fetch bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// 🟢 POST new booking
router.post("/", async (req, res) => {
  try {
    const { userId, roomName, startTime, endTime, purpose } = req.body;

    const booking = await prisma.bookingMeeting.create({
      data: {
        userId: Number(userId) || 1, // default user (sementara)
        roomName: roomName || "Default Room",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("❌ Failed to create booking:", err);
    res.status(400).json({ error: "Failed to create booking", details: err });
  }
});

// 🟡 PUT update booking
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, startTime, endTime, roomName } = req.body;

    const updated = await prisma.bookingMeeting.update({
      where: { id: Number(id) },
      data: {
        purpose,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        roomName,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update booking:", err);
    res.status(400).json({ error: "Failed to update booking", details: err });
  }
});

// 🔴 DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bookingMeeting.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete booking:", err);
    res.status(400).json({ error: "Failed to delete booking", details: err });
  }
});

export default router;
