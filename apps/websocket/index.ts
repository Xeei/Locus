import express from "express";
import { createServer } from "http";
import {pinoHttp} from "pino-http";
import { Server } from "socket.io";
import { logger } from "./libs/logger";

const app = express();
app.use(pinoHttp({logger}))
const httpServer = createServer(app);
const io = new Server(httpServer);

// use for log transaction
io.use((socket, next) => {
  socket.log = logger.child({ socketId: socket.id });
  next();
});

// this is for handle connection
io.on("connection", (socket) => {
	// log header of socket that connect
	socket.log.info({ headers: socket.handshake.headers }, 'New socket connection established');


	socket.emit("message", "Welcome to Locus Websocket "+socket.id)

	// TODO: Learn how to make best pratice handle event in socket.io to be able to scale up the system
	// TODO: Make handle event for sending coordinate of cursor
});
logger.info("Application start on port: "+ process.env.PORT + " http://localhost:"+process.env.PORT)
httpServer.listen(process.env.PORT);