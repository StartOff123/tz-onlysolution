import axios, { AxiosError } from 'axios';
import createHttpError from 'http-errors';

import { ReCaptchaTypes } from '~types/reCaptcha.types';

export class ReCaptcha {
	private readonly apiCreateTask = 'https://api.rucaptcha.com/createTask';
	private readonly apiGetTaskResult =
		'https://api.rucaptcha.com/getTaskResult';

	private taskId: string | null = null;
	private taskResult: ReCaptchaTypes.GetTaskResultResponse | null = null;
	private taskCompleted: boolean = false;

	constructor(private readonly config: ReCaptchaTypes.ReCaptchaConfig) {
		this.config = config;
		this.config.logs = config.logs || false;
	}

	private async createTask(): Promise<ReCaptchaTypes.CreateTaskResponse> {
		try {
			this.config.logs && console.log('Creating task...');
			const { data } =
				await axios.post<ReCaptchaTypes.CreateTaskResponse>(
					this.apiCreateTask,
					{
						clientKey: this.config.apiKey,
						task: {
							type: 'RecaptchaV2TaskProxyless',
							websiteURL: this.config.siteUrl,
							websiteKey: this.config.siteKey
						}
					}
				);
			this.config.logs &&
				console.log('Created task successfully, ID:', data.taskId);

			return data;
		} catch (error: AxiosError<ReCaptchaTypes.ResponseError> | any) {
			console.error(error);

			throw createHttpError(error.response.statusCode || 500, {
				name: error.response.data.errorCode,
				message: error.response.data.errorDescription
			});
		}
	}

	private async getTaskResult(): Promise<ReCaptchaTypes.GetTaskResultResponse> {
		try {
			this.config.logs && console.log('Getting task result...');

			while (!this.taskCompleted) {
				await new Promise(resolve => setTimeout(resolve, 5000));

				const { data } =
					await axios.post<ReCaptchaTypes.GetTaskResultResponse>(
						this.apiGetTaskResult,
						{
							clientKey: this.config.apiKey,
							taskId: this.taskId
						}
					);

				this.taskCompleted = data.status === 'ready';
				this.config.logs &&
					data.status !== 'ready' &&
					console.log('Task progress:', data);

				if (this.taskCompleted) {
					this.taskResult = data;
				}
			}

			this.config.logs &&
				console.log('Got task result successfully: ', this.taskResult);

			return this.taskResult!;
		} catch (error: AxiosError<ReCaptchaTypes.ResponseError> | any) {
			console.error(error);

			throw createHttpError(error.response.statusCode || 500, {
				name: error.response.data.errorCode,
				message: error.response.data.errorDescription
			});
		}
	}

	public async solve(): Promise<string> {
		this.taskId = (await this.createTask()).taskId!;

		return (await this.getTaskResult()).solution
			.gRecaptchaResponse as string;
	}
}
