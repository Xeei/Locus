import express from "express";
import { createServer } from "http";
import {pinoHttp} from "pino-http";
import { Server } from "socket.io";
import { logger } from "./libs/logger";

const app = express();
app.use(pinoHttp({logger}))
const httpServer = createServer(app);
const io = new Server(httpServer);


io.use((socket, next) => {
  socket.log = logger.child({ socketId: socket.id });
  next();
});

io.on("connection", (socket) => {
	socket.log.info({ headers: socket.handshake.headers }, 'New socket connection established');

	socket.emit("message", "Welcome to Locus Websocket "+socket.id)
});
logger.info("Application start on port: "+ process.env.PORT + " http://localhost:"+process.env.PORT)
httpServer.listen(process.env.PORT);