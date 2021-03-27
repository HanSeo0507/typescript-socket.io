import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import JoinButton from "src/components/JoinButton";
import Chat from "src/components/Chat";

enum USER_STATUS {
	NOT_INIT = 0,
	INITED = 1,
	JOINED = 2,
}

enum MSG_TYPE {
	MINE = "mine",
	AUDIENCE = "audience",
	NOTIFY = "notify",
}

interface IRoom {
	room: string;
	users: number;
}

interface IUser {
	id: string;
	name: string;
	room: string;
}

const Main: React.FC = ({}) => {
	const [user, setUser] = useState<IUser>();
	const [status, setStatus] = useState(USER_STATUS.NOT_INIT);
	const [rooms, setRooms] = useState<IRoom[]>([]);
	const [name, setName] = useState("");
	const [chat, setChat] = useState("");
	const [room, setRoom] = useState<{ room: string; users: number } | undefined>();
	const [messages, setMessages] = useState<{ message: string; sender: string; senderName: string }[]>([]);

	const messagesEndRef = useRef<null | HTMLDivElement>(null);

	useEffect(() => {
		window.socket.on("disconnecting", (data: any) => {
			console.log(data);
		});

		window.socket.on("connected", (data: any) => {
			setStatus(data.status);
		});

		window.socket.on("inited", (data: any) => {
			setStatus(data.status);
			setUser(data.user);
			if (data.error) alert(data.error);
		});

		window.socket.on("joined", (data: any) => {
			setStatus(data.status);
			setRoom(data.room);
			setUser(data.user);
			if (data.error) alert(data.error);
		});

		window.socket.on("left", (data: any) => {
			setStatus(data.status);
			setUser(data.user);

			setMessages([]);
			setRoom(undefined);
			if (data.error) alert(data.error);
		});

		window.socket.on("updateRoom", (data: any) => {
			setRooms(data.rooms);
		});

		window.socket.on("updateRoomInfo", (data: any) => {
			setRoom(data);
		});

		window.socket.on("sendMessage", (data: any) => {
			setMessages((oldMsg) => [...oldMsg, { message: data.message, sender: data.sender, senderName: data.senderName }]);
		});
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const onChangeChat = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setChat(event.target.value);
	};

	const onClickInit = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		window.socket.emit("init", { name });
	};

	const onClickCreateRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		window.socket.emit("join", {});
	};

	const onClickJoinRoom = (event: React.MouseEvent<HTMLButtonElement>, room: string) => {
		event.preventDefault();
		window.socket.emit("join", { room });
	};

	const onClickLeaveRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		window.socket.emit("leave", {});
	};

	const onKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			window.socket.emit("sendMessage", { message: chat });
			setChat("");
		}
	};

	status;
	return (
		<div className="container h-100">
			<div className="row h-100 align-items-center">
				<div className="mx-auto w-100" style={{ display: "flex", flexDirection: "column" }}>
					{status === USER_STATUS.NOT_INIT && (
						<Container className="mb-4">
							<InitialContent>
								<p>닉네임을 입력하세요</p>
								<input value={name} onChange={onChangeName} disabled={status !== USER_STATUS.NOT_INIT} />
								<Button onClick={onClickInit} disabled={status !== USER_STATUS.NOT_INIT}>
									저장하기
								</Button>
							</InitialContent>
						</Container>
					)}
					{status === USER_STATUS.INITED && (
						<Container>
							<ContainerHeader className="mb-2">
								<p>채팅방</p>
								<button onClick={onClickCreateRoom}>
									<p>+ 채팅방 생성</p>
								</button>
							</ContainerHeader>
							<div className="d-flex w-100">
								{rooms.length > 0 ? (
									rooms.map((v, k) => {
										return (
											<RoomTitle key={k}>
												<p>채팅방 {v.room.split("-")[1]}</p>
												<JoinButton activateText="참가하기" onClick={(e) => onClickJoinRoom(e, v.room.split("-")[1])}>
													{v.users}명 참가중
												</JoinButton>
											</RoomTitle>
										);
									})
								) : (
									<ContentWrong className="mx-auto">
										<FontAwesomeIcon icon={faExclamationCircle} />
										<div style={{ lineHeight: "1.2rem" }}>
											<p>활성화된 채팅방이 없습니다</p>
											<p>
												<strong>+ 채팅방 생성</strong>을 눌러 채팅을 시작하세요!
											</p>
										</div>
									</ContentWrong>
								)}
							</div>
						</Container>
					)}
					{status === USER_STATUS.JOINED && room && (
						<>
							<Container className="mb-4">
								<button className="d-flex" style={{ background: "transparent" }} onClick={onClickLeaveRoom}>
									<ExitMenu>
										<FontAwesomeIcon icon={faDoorOpen} className="mr-2" />
										<p>나가기</p>
									</ExitMenu>
								</button>
							</Container>
							<Container>
								<RoomTitle className="mb-3">
									<p>채팅방 {room.room.split("-")[1]}</p>
									<p>{room.users}명 대화 중</p>
								</RoomTitle>
								<ChatContainer className="w-100 mb-4">
									<ChatContainer className="w-100">
										{messages.map((v, k) => {
											return (
												<Chat key={k} isMine={v.sender === user?.id} name={v.senderName}>
													{v.message}
												</Chat>
											);
										})}
										<div ref={messagesEndRef}></div>
									</ChatContainer>
								</ChatContainer>
								<div className="w-100 d-flex" style={{ justifyContent: "space-between" }}>
									<ChatInput onChange={onChangeChat} value={chat} onKeyPress={onKeyPress} />
									<Button style={{ float: "right" }}>전송</Button>
								</div>
							</Container>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Main;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	background: white;

	padding: 1.5rem 2rem;
	border-radius: 1rem;
	box-shadow: 0px 0px 1rem rgba(0, 0, 0, 0.05);
`;

const ContainerHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;

	& > p:nth-child(1) {
		float: left;
		font-weight: 500;
	}

	& > *:nth-child(2) {
		float: right;
		font-size: 14px;
		color: #888888;
	}

	& > button {
		background: transparent;
	}
`;

const ContentWrong = styled.div`
	color: #999999;
	font-size: 30px;
	text-align: center;
	padding: 3rem 0;

	& > div {
		font-size: 15px;
		font-weight: 700;
		margin-top: 0.6rem;
	}
`;

const InitialContent = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
	text-align: center;
	margin: 0 auto;

	& > p {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	& > input {
		padding: 0.5rem 1.5rem;
		border-radius: 1rem;
		margin: 0 auto 1.3rem auto;
		text-align: center;

		&:focus {
			outline: none;
		}
	}
`;

const Button = styled.button`
	color: white;
	font-weight: 900;
	background-color: var(--primary);

	padding: 1rem;
	border-radius: 1rem;
`;

const RoomTitle = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;

	& > p:nth-child(1) {
		float: left;
		font-weight: 500;
	}

	& > *:nth-child(2) {
		float: right;
		font-size: 14px;
	}
`;

const ChatInput = styled.textarea`
	width: 85%;
	padding: 1rem 1rem 0 1rem;
	border-radius: 1rem;

	&:focus {
		border: 0.15rem solid black;
		outline: none;
	}
`;

const ExitMenu = styled.div`
	display: flex;
	font-size: 17px;
	font-weight: 700;
	color: #777777;
`;

const ChatContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	height: 25rem;
`;
