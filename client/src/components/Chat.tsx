import React from "react";
import styled from "styled-components";

const Chat: React.FC<{ isMine: boolean; name: string } & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	return (
		<Container {...props}>
			{props.name !== "server" && <p className={props.isMine ? "ml-auto" : "mr-auto"}>{props.name}</p>}
			<Children isMine={props.isMine} isNotify={props.name === "server"} className={props.name === "server" ? "" : props.isMine ? "ml-auto" : "mr-auto"}>
				<p className={props.name === "server" ? "mx-auto" : ""}>{props.children && props.children}</p>
			</Children>
		</Container>
	);
};

export default Chat;

const Container = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
	margin-bottom: 0.5rem;

	& > p:first-child {
		margin-bottom: 0.3rem;
		font-size: 12px;
	}
`;

const Children = styled.div<{ isMine: boolean; isNotify: boolean }>`
	display: flex;

	font-weight: 500;
	font-size: ${(props) => (props.isNotify ? "12px" : "16px")};
	color: ${(props) => (props.isMine ? "white" : "black")};
	background: ${(props) => (props.isNotify ? "transparent" : props.isMine ? "var(--primary)" : "rgb(227, 230, 234)")};
	padding: ${(props) => (props.isNotify ? "0.4rem" : "0.7rem 1rem;")};
	border-radius: ${(props) => (props.isNotify ? "0" : props.isMine ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0")};
`;
