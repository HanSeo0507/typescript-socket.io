import http, { createServer } from "http";
import express from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "src/middlewares";

class App {
	public app: express.Application;
	public server: http.Server;

	constructor() {
		this.app = express();
		this.initializeMiddlewares();
		this.initializeRouter();
		this.initializeErrorHandler();
	}

	public async listen(port: number) {
		this.server = createServer(this.app);
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
}

export default App;
