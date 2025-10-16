require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const { conn } = require("./config/db");
const app = express();
app.use(express.json());
app.use(cors());
require("./workers/contestWorker");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const codeRouter = require("./routes/codeRoutes")(io);
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const batchRouter = require("./routes/batchRoutes");
const contestRouter = require("./routes/contestRoutes")(io);
const {handleFullScreenChange,handleTabSwitch}=require("./utils/handleViolation")

console.log("hi");

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);
  socket.on("fullScreenChange",async ({contestId,token})=>{
    console.log("Full screen ",contestId,token);
    await handleFullScreenChange(contestId,token);

  })
  socket.on("tabSwitch",async ({contestId,token})=>{
    console.log("Tab Switch ",contestId,token);
    await handleTabSwitch(contestId,token);
  })
  socket.on("joinContestRoom",({id})=>{
    socket.join(`Contest_${id}`);
    console.log(`User ${socket.id} joined contest_${id}`);
  });
    socket.on("leaveContestRoom",({id})=>{
    socket.leave(`Contest_${id}`);
    console.log(`User ${socket.id} left contest_${id}`);
  });
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});
app.use("/api/code", codeRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/batches", batchRouter);
app.use("/api/contests",contestRouter);

server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
  try {
    conn();
  } catch (e) {
    console.log("Error: " + e);
  }
});
