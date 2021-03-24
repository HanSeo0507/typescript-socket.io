import { Request, Response, NextFunction } from "express";
import { HttpException } from "src/classes";

const errorHandler = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
	console.error(error);

	const { status, message } = error;
	return res.status(status).json({ message });
};

export default errorHandler;
