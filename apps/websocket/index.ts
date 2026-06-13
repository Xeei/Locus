import express from "express";
import { createServer } from "http";
import {pinoHttp} from "pino-http";
import { Server } from "socket.io";
import { logger } from "./libs/logger";
import type { CursorPulse } from "@locus/shared";

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

	// TODO: Learn how to make best practice handle event in socket.io to be able to scale up the system
	// TODO: Make handle event for sending coordinate of cursor

	// handle "cursor:move" for connector that connected
	socket.on("cursor:move", (arg: CursorPulse) => {
		console.log(arg.coordinate)
	})
});
logger.info("Application start on port: "+ process.env.PORT + " http://localhost:"+process.env.PORT)
httpServer.listen(process.env.PORT);