export namespace ReCaptchaTypes {
	export interface ReCaptchaConfig {
		siteKey: string;
		siteUrl: string;
		apiKey: string;
		logs?: boolean;
	}

	export interface CreateTaskResponse {
		errorId: number;
		taskId: string;
	}

	export interface GetTaskResultResponse {
		errorId: number;
		status: string;
		solution: {
			gRecaptchaResponse: string;
		};
		cost: string;
		ip: string;
		createTime: bigint;
		endTime: bigint;
		solveCount: 1;
	}

	export interface ResponseError {
		errorId: number;
		errorCode: string;
		errorDescription: string;
	}
}
