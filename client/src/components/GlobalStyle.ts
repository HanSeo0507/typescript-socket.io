import { createGlobalStyle } from "styled-components";
import styledReset from "styled-reset";

const GlobalStyle = createGlobalStyle`
    ${styledReset}

    html, body, #app {
        height:100%;
    }

    body {
        background: #F2F2FA;
        font-size: 16px;
        font-family: "Noto Sans KR", sans-serif;
    }

    a, a:hover, a:active {
        text-decoration: none;
        outline: none;
    }

    button {
        border: none;
	    outline: none;
    }

`;

export default GlobalStyle;
