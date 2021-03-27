import { Socket } from "socket.io";
import crypto from "crypto";

type CustomSocket = Socket & { name: string };

interface IUser {
	id: string;
	name: string;
	room: string;
}

enum MSG_TYPE {
	MINE = "mine",
	AUDIENCE = "audience",
	NOTIFY = "notify",
}

const users: IUser[] = [];

const initUser = (socket: CustomSocket, id: string, name: string) => {
	if (!name) return { error: "닉네임이 필요합니다" };
	console.log(name);
	const existingUser = users.find((v) => v.name === name);
	if (existingUser) return { error: "이미 이용 중인 닉네임입니다" };

	const user = { id, name, room: "room-queue" };
	users.push(user);
	socket.name = name;
	socket.join("room-queue");
	return { user };
};

const getUser = (socket: CustomSocket) => {
	const userIndex = users.findIndex((v) => v.name === socket.name);
	const user = users[userIndex];
	if (userIndex <= -1) return { error: "유저를 찾을 수 없습니다" };

	return { user };
};

const joinUser = (socket: CustomSocket, room?: string) => {
	if (!room) room = crypto.randomBytes(3).toString("hex");
	const userIndex = users.findIndex((v) => v.name === socket.name);
	const user = users[userIndex];

	if (userIndex <= -1) return { error: "유저를 찾을 수 없습니다" };
	if (user.room && user.room !== "room-queue") return { error: "이미 채팅방에 접속 중입니다" };

	user.room = "room-" + room;
	socket.join("room-" + room);
	socket.broadcast.to(user.room).emit("sendMessage", { message: `${user.name}님이 참가하셨습니다`, sender: "server", senderName: "server" });
	return { user, room: { room, users: 1 } };
};

const leaveUser = (socket: CustomSocket) => {
	const userIndex = users.findIndex((v) => v.name === socket.name);
	const user = users[userIndex];

	if (userIndex <= -1) return { error: "유저를 찾을 수 없습니다" };

	socket.leave(user.room);
	socket.broadcast.to(user.room).emit("sendMessage", { message: `${user.name}님이 나가셨습니다`, sender: "server", senderName: "server" });
	socket.join("room-queue");
	user.room = "room-queue";

	return { user };
};

const deleteUser = (socket: CustomSocket) => {
	const userIndex = users.findIndex((v) => v.name === socket.name);
	delete users[userIndex];
};

export { initUser, joinUser, leaveUser, deleteUser, getUser };
