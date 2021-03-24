class HttpException {
	public status: number;
	public message: string;

	constructor(status?: number, message?: string) {
		this.status = status || 500;
		this.message = message || "서버에서 알 수 없는 오류가 발생하였습니다";
	}
}

export { HttpException };
