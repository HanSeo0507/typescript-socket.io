import React from "react";
import ReactDOM from "react-dom";
import App from "src/App";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-notifications-component/dist/theme.css";

import socketIOClient from "socket.io-client";
window.socket = socketIOClient.connect("http://localhost:4000", { transports: ["websocket", "polling", "flashsocket"] });

ReactDOM.render(<App />, document.getElementById("app"));
