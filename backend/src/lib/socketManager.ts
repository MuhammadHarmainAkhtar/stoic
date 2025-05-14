import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import Message, { MessageType } from "../models/messageModel";
import User from "../models/userModel";
import Notification, { NotificationType } from "../models/notificationModel";
import mongoose from "mongoose";

export default class SocketManager {
  public io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private activeRooms: Map<string, Set<string>> = new Map(); // roomId -> Set of socketIds

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      try {
        const secret = process.env.JWT_SECRET || "default_secret";
        const decoded = jwt.verify(token, secret) as any;
        socket.data.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.setupSocketEvents();
  }

  private setupSocketEvents(): void {
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;

      // Store user's socket id
      this.userSockets.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Handle user going online
      this.io.emit("user:status", { userId, status: "online" });

      // Handle direct messages
      socket.on("message:direct", async (data) => {
        try {
          const { receiverId, content, type } = data;
          const senderId = userId;

          // Save message to database
          const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            type: type || MessageType.TEXT,
            content,
          });

          await message.populate("sender", "username name profilePicture");

          // Send to receiver if online
          const receiverSocketId = this.userSockets.get(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("message:direct", message);
          }

          // Create notification for receiver
          await Notification.create({
            type: NotificationType.DIRECT_MESSAGE,
            from: senderId,
            to: receiverId,
            message: "You have a new message",
          });

          // Send to sender (acknowledgment)
          socket.emit("message:direct", message);
        } catch (error) {
          console.error("Error sending direct message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Handle circle messages
      socket.on("message:circle", async (data) => {
        try {
          const { circleId, content, type } = data;
          const senderId = userId;

          // Save message to database
          const message = await Message.create({
            sender: senderId,
            circle: circleId,
            type: type || MessageType.TEXT,
            content,
          });

          await message.populate("sender", "username name profilePicture");

          // Send to all circle members
          this.io.to(`circle:${circleId}`).emit("message:circle", message);
        } catch (error) {
          console.error("Error sending circle message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Join circle room
      socket.on("circle:join", (data) => {
        const { circleId } = data;
        socket.join(`circle:${circleId}`);
        console.log(`User ${userId} joined room circle:${circleId}`);
      });

      // Leave circle room
      socket.on("circle:leave", (data) => {
        const { circleId } = data;
        socket.leave(`circle:${circleId}`);
        console.log(`User ${userId} left room circle:${circleId}`);
      });

      // Video call signaling
      socket.on("call:start", async (data) => {
        try {
          const { receiverId, offer } = data;
          const callerId = userId;

          // Get caller info
          const caller = await User.findById(callerId).select(
            "username name profilePicture"
          );

          // Send to receiver if online
          const receiverSocketId = this.userSockets.get(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("call:incoming", {
              callerId,
              caller,
              offer,
            });
          }
        } catch (error) {
          console.error("Error starting call:", error);
          socket.emit("error", { message: "Failed to start call" });
        }
      });

      // Handle call answer
      socket.on("call:answer", (data) => {
        const { callerId, answer } = data;
        const callerSocketId = this.userSockets.get(callerId);

        if (callerSocketId) {
          this.io.to(callerSocketId).emit("call:answered", {
            answerer: userId,
            answer,
          });
        }
      });

      // Handle ICE candidates
      socket.on("call:ice-candidate", (data) => {
        const { candidate, targetId } = data;
        const targetSocketId = this.userSockets.get(targetId);

        if (targetSocketId) {
          this.io.to(targetSocketId).emit("call:ice-candidate", {
            candidate,
            from: userId,
          });
        }
      });

      // Handle call hang up
      socket.on("call:end", (data) => {
        const { targetId } = data;
        const targetSocketId = this.userSockets.get(targetId);

        if (targetSocketId) {
          this.io.to(targetSocketId).emit("call:ended", {
            from: userId,
          });
        }
      });

      // Handle call reject
      socket.on("call:reject", (data) => {
        const { callerId } = data;
        const callerSocketId = this.userSockets.get(callerId);

        if (callerSocketId) {
          this.io.to(callerSocketId).emit("call:rejected", {
            by: userId,
          });
        }
      });

      // Group meeting management
      socket.on("meeting:join", (data) => {
        const { meetingId } = data;
        const roomId = `meeting:${meetingId}`;

        socket.join(roomId);

        // Track active users in this meeting
        if (!this.activeRooms.has(roomId)) {
          this.activeRooms.set(roomId, new Set());
        }
        this.activeRooms.get(roomId)?.add(socket.id);

        // Notify others in the meeting
        socket.to(roomId).emit("meeting:user-joined", {
          userId,
          meetingId,
        });

        // Send list of participants to the new user
        const participants = Array.from(this.activeRooms.get(roomId) || [])
          .filter((sid) => sid !== socket.id)
          .map((sid) => {
            const user = this.findUserBySocketId(sid);
            return { socketId: sid, userId: user };
          });

        socket.emit("meeting:participants", {
          participants,
        });
      });

      socket.on("meeting:leave", (data) => {
        const { meetingId } = data;
        const roomId = `meeting:${meetingId}`;

        socket.leave(roomId);

        // Remove user from active participants
        this.activeRooms.get(roomId)?.delete(socket.id);
        if (this.activeRooms.get(roomId)?.size === 0) {
          this.activeRooms.delete(roomId);
        }

        // Notify others in the meeting
        socket.to(roomId).emit("meeting:user-left", {
          userId,
          meetingId,
        });
      });

      // Handle meeting offer to specific participant
      socket.on("meeting:offer", (data) => {
        const { targetSocketId, offer, meetingId } = data;

        this.io.to(targetSocketId).emit("meeting:offer", {
          from: socket.id,
          fromUserId: userId,
          offer,
          meetingId,
        });
      });

      // Handle meeting answer
      socket.on("meeting:answer", (data) => {
        const { targetSocketId, answer } = data;

        this.io.to(targetSocketId).emit("meeting:answer", {
          from: socket.id,
          answer,
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        this.userSockets.delete(userId);

        // Remove from all active rooms
        for (const [roomId, participants] of this.activeRooms.entries()) {
          if (participants.has(socket.id)) {
            participants.delete(socket.id);

            // Extract meetingId from roomId
            const meetingId = roomId.split(":")[1];

            // Notify others in the meeting
            this.io.to(roomId).emit("meeting:user-left", {
              userId,
              meetingId,
            });

            // Clean up empty rooms
            if (participants.size === 0) {
              this.activeRooms.delete(roomId);
            }
          }
        }

        // Notify other users that user is offline
        this.io.emit("user:status", { userId, status: "offline" });
      });
    });
  }

  // Helper to find userId by socketId
  private findUserBySocketId(socketId: string): string | undefined {
    for (const [userId, sid] of this.userSockets.entries()) {
      if (sid === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  // Method to emit notification to a specific user
  public emitNotification(userId: string, notification: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("notification", notification);
    }
  }

  // Method to notify meeting participants
  public notifyMeeting(meetingId: string, event: string, data: any): void {
    const roomId = `meeting:${meetingId}`;
    this.io.to(roomId).emit(event, data);
  }

  // Helper methods for controllers to use
  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  sendDirectMessage(
    fromUserId: string,
    toUserId: string,
    message: any
  ): boolean {
    const receiverSocketId = this.userSockets.get(toUserId);
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit("message:direct", message);
      return true;
    }
    return false;
  }

  sendCircleMessage(circleId: string, message: any): void {
    this.io.to(`circle:${circleId}`).emit("message:circle", message);
  }

  sendNotification(userId: string, notification: any): boolean {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("notification", notification);
      return true;
    }
    return false;
  }

  // Meeting room management
  joinMeetingRoom(userId: string, meetingId: string): boolean {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`meeting:${meetingId}`);

        // Track active rooms
        if (!this.activeRooms.has(`meeting:${meetingId}`)) {
          this.activeRooms.set(`meeting:${meetingId}`, new Set());
        }
        this.activeRooms.get(`meeting:${meetingId}`)?.add(socketId);

        return true;
      }
    }
    return false;
  }

  leaveMeetingRoom(userId: string, meetingId: string): boolean {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`meeting:${meetingId}`);

        // Update active rooms
        const roomSet = this.activeRooms.get(`meeting:${meetingId}`);
        if (roomSet) {
          roomSet.delete(socketId);
          if (roomSet.size === 0) {
            this.activeRooms.delete(`meeting:${meetingId}`);
          }
        }

        return true;
      }
    }
    return false;
  }
}
