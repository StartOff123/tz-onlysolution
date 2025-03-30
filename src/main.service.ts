import { LoginDto } from '~dto/login.dto';

import { connectPageWithProxy } from '~utils/connectPageWithProxy.util';

export class MainService {
	async login(dto: LoginDto) {
		const { email, password, proxy } = dto;

		const page = await connectPageWithProxy(proxy);

		try {
			page.goto(process.env.ONLYFANS_URL!);

			await page.waitForSelector('input[name="email"]');
			await page.type('input[name="email"]', email);
			await page.waitForSelector('input[name="password"]');
			await page.type('input[name="password"]', password);
			await page.click('button[data-v-6a0aff74]');

			await page.waitForSelector('div[data-v-96f37e36] div');

			const createTaskResponse = await fetch(
				'https://api.rucaptcha.com/createTask',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						key: process.env.RUCAPTCHA_CLIENT_KEY!,
						task: {
							type: 'RecaptchaV2TaskProxyless',
							websiteURL: process.env.ONLYFANS_URL!,
							websiteKey: process.env.ONLYFANS_CAPTCHA_KEY!,
							isInvisible: false
						}
					})
				}
			);

			console.log('create task response');

			const createTaskData = await createTaskResponse.json();

			if (createTaskData.errorId) {
				console.error('Create task error', createTaskData);
				return;
			}

			const taskId = createTaskData.taskId;
			let taskCompleted = false;
			let taskResult: any;

			while (!taskCompleted) {
				await new Promise(resolve => setTimeout(resolve, 5000));

				const getTaskResultResponse = await fetch(
					'https://api.rucaptcha.com/getTaskResult',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							clientKey: process.env.RUCAPTCHA_CLIENT_KEY!,
							taskId
						})
					}
				);

				const getTaskResultData = await getTaskResultResponse.json();

				if (getTaskResultData.errorId) {
					console.error('Get task result error', getTaskResultData);
					return;
				}

				taskCompleted = getTaskResultData.status === 'ready';
				if (taskCompleted) {
					taskResult = getTaskResultData.solution.gRecaptchaResponse;

					console.log('task result');
				}
			}

			const reCaptcha = await page.waitForSelector(
				'#g-recaptcha-response'
			);
			await page.evaluate(
				([result, reCaptcha]) => {
					reCaptcha.innerHTML = result;
				},
				[taskResult, reCaptcha]
			);
			1;
			return { email, password };
		} catch (error) {
			console.log(error);
		}
	}

	async getInfo() {}
}
