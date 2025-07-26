require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors=require('cors');
const {conn}=require("./config/db")

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const codeRouter = require('./routes/codeRoutes')(io);
const authRouter=require('./routes/authRoutes');
const userRouter=require('./routes/userRoutes');
io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});
app.use('/api/code', codeRouter);
app.use('/api/auth',authRouter);
app.use('/api/users',userRouter);
server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
    try{
        conn();
    }
    catch(e){
        console.log("Error: "+e);
    }
});
