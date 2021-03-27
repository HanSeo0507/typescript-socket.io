export {};

declare global {
	interface Window {
		socket: SocketIOClient.Socket;
	}
}
