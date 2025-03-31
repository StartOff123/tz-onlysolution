import { LoginDto } from '~dto/login.dto';

import { connectPageWithProxy } from '~utils/connectPageWithProxy.util';

export class MainService {
	async login(dto: LoginDto) {
		const { email, password, proxy } = dto;

		const page = await connectPageWithProxy(proxy);

		try {
			await page.goto(process.env.ONLYFANS_URL!);
			await page.waitForNetworkIdle();

			await page.waitForSelector('input[name="email"]');
			await page.type('input[name="email"]', email);
			await page.waitForSelector('input[name="password"]');
			await page.type('input[name="password"]', password);
			await page.click('button[data-v-6a0aff74]');

			await page.waitForSelector('#g-recaptcha-response');

			// console.log('waiting for recaptcha');

			// const createTaskResponse = await fetch(
			// 	'https://api.rucaptcha.com/createTask',
			// 	{
			// 		method: 'POST',
			// 		headers: {
			// 			'Content-Type': 'application/json'
			// 		},
			// 		body: JSON.stringify({
			// 			clientKey: process.env.RUCAPTCHA_CLIENT_KEY!,
			// 			task: {
			// 				type: 'RecaptchaV2TaskProxyless',
			// 				websiteURL: process.env.ONLYFANS_URL!,
			// 				websiteKey: process.env.ONLYFANS_CAPTCHA_KEY!,
			// 				isInvisible: false
			// 			}
			// 		})
			// 	}
			// );

			// console.log('create task response');

			// const createTaskData = await createTaskResponse.json();

			// if (createTaskData.errorId) {
			// 	console.error('Create task error', createTaskData);
			// 	return;
			// }

			// const taskId = createTaskData.taskId;
			// let taskCompleted = false;
			// let taskResult: any;

			// while (!taskCompleted) {
			// 	await new Promise(resolve => setTimeout(resolve, 5000));

			// 	const getTaskResultResponse = await fetch(
			// 		'https://api.rucaptcha.com/getTaskResult',
			// 		{
			// 			method: 'POST',
			// 			headers: {
			// 				'Content-Type': 'application/json'
			// 			},
			// 			body: JSON.stringify({
			// 				clientKey: process.env.RUCAPTCHA_CLIENT_KEY!,
			// 				taskId
			// 			})
			// 		}
			// 	);

			// 	const getTaskResultData = await getTaskResultResponse.json();

			// 	console.log('get task result response', getTaskResultData);

			// 	if (getTaskResultData.errorId) {
			// 		console.error('Get task result error', getTaskResultData);
			// 		return;
			// 	}

			// 	taskCompleted = getTaskResultData.status === 'ready';
			// 	if (taskCompleted) {
			// 		taskResult = getTaskResultData.solution.gRecaptchaResponse;
			// 	}
			// }

			// await page.evaluate(result => {
			// 	(
			// 		document.getElementById(
			// 			'g-recaptcha-response'
			// 		) as HTMLTextAreaElement
			// 	).innerHTML = result;
			// }, taskResult);

			const from = await page.$('form[data-v-6a0aff74]');
			await from?.evaluate(form => form.submit());

			return { email, password };
		} catch (error) {
			console.log(error);
		}
	}

	async getInfo() {}
}
