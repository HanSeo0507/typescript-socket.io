import http, { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "src/middlewares";

import { deleteUser, getUser, initUser, joinUser, leaveUser } from "src/controller/user";

enum USER_STATUS {
	NOT_INIT = 0,
	INITED = 1,
	JOINED = 2,
}
class App {
	public app: express.Application;
	public server: http.Server;
	public io: Server;

	constructor() {
		this.app = express();
		this.initializeMiddlewares();
		this.initializeRouter();
		this.initializeErrorHandler();
	}

	public async listen(port: number) {
		this.server = createServer(this.app);
		this.io = new Server(this.server);
		this.initializeSocketIO();

		this.server.listen(port, () => {
			console.log(`> Listening on http://localhost:${port}`);
		});

		this.server.on("error", (error) => {
			console.log(`> Error on http server: ${error}`);
		});
	}

	private initializeMiddlewares() {
		this.app.use(
			cors({
				origin: "http://localhost:3000",
				credentials: true,
			})
		);
		this.app.use(helmet());
		this.app.use(morgan("dev"));
		this.app.use(cookieParser());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
	}

	private initializeRouter() {}

	private initializeErrorHandler() {
		this.app.use(errorHandler);
	}

	private initializeSocketIO() {
		this.io.on("connection", (socket: Socket & { name: string }) => {
			socket.emit("connected", { status: USER_STATUS.NOT_INIT });

			socket.on("disconnect", (reason: any) => {
				const { error, user } = getUser(socket);
				if (error) return;
				console.log(error ? error : user.name + " left");
				console.log(user);
				if (user.room && user.room! == "room-queue") socket.broadcast.to(user.room).emit("sendMessage", { message: `${user.name}님이 나가셨습니다`, sender: "server", senderName: "server" });
				deleteUser(socket);
			});

			socket.on("init", (data: any) => {
				const { error, user } = initUser(socket, socket.id, data.name);
				if (error) return socket.emit("inited", { status: USER_STATUS.NOT_INIT, error });

				console.log(error ? error : user.name + " inited");

				return socket.emit("inited", { status: USER_STATUS.INITED, user });
			});

			socket.on("join", (data: any) => {
				const { error, user, room } = joinUser(socket, data.room);
				if (error) return socket.emit("joined", { status: USER_STATUS.INITED, error });

				console.log(error ? error : user.name + " joined - " + user.room);
				return socket.emit("joined", { status: USER_STATUS.JOINED, room, user });
			});

			socket.on("leave", (data: any) => {
				const { error, user } = leaveUser(socket);
				if (error) return socket.emit("left", { status: USER_STATUS.NOT_INIT });

				console.log(error ? error : user.name + " left");
				return socket.emit("left", { status: USER_STATUS.INITED, user });
			});

			socket.on("sendMessage", (data: any) => {
				const { user } = getUser(socket);

				console.log(user.name + " sended - " + data.message);
				this.io.to(user.room).emit("sendMessage", { message: data.message, sender: user.id, senderName: user.name });
			});

			setInterval(() => {
				const rooms = Array.from(this.io.sockets.adapter.rooms);
				const filterRooms = rooms.find((room) => room[0].split("-")[0] === "room" && room[0].split("-")[1] !== "queue") || [];
				const clientRooms = [];

				for (let index = 0; index < filterRooms.length - 1; index++) {
					const roomId: any = filterRooms[index];
					const room = { room: roomId, users: this.io.sockets.adapter.rooms.get(roomId).size };
					clientRooms.push(room);
				}

				clientRooms.map((v, k) => {
					this.io.sockets.in(v.room).emit("updateRoomInfo", { room: v.room, users: this.io.sockets.adapter.rooms.get(v.room).size });
				});

				this.io.sockets.in("room-queue").emit("updateRoom", { rooms: clientRooms });
			}, 1000);
		});
	}
}

export default App;
