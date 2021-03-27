import React, { useState } from "react";
import styled from "styled-components";

const JoinButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { activateText: string }> = (props) => {
	const [isMouseEnter, setIsMouseEnter] = useState(false);

	const onMouseEnter = (event: any) => {
		setIsMouseEnter(true);
	};

	const onMouseLeave = (event: any) => {
		setIsMouseEnter(false);
	};

	return (
		<Button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} {...props}>
			{props.children && isMouseEnter ? props.activateText : props.children}
		</Button>
	);
};

export default JoinButton;

const Button = styled.button`
	color: white;
	font-weight: 700;
	background-color: var(--primary);

	padding: 0.8rem 1.5rem;
	border-radius: 1rem;
`;
