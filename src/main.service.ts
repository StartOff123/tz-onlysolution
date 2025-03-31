import { LoginDto } from '~dto/login.dto';

import { connectPageWithProxy } from '~utils/connectPageWithProxy.util';

import { ReCaptcha } from './reCaptcha';

export class MainService {
	async login(dto: LoginDto) {
		const { email, password, proxy } = dto;

		const page = await connectPageWithProxy(proxy);

		try {
			await page.goto(process.env.ONLYFANS_URL!, {
				waitUntil: 'domcontentloaded'
			});
			await page.waitForNetworkIdle();

			await page.waitForSelector('input[name="email"]');
			await page.type('input[name="email"]', email);
			await page.waitForSelector('input[name="password"]');
			await page.type('input[name="password"]', password);
			await page.click('button[data-v-6a0aff74]');

			await page.waitForSelector('#g-recaptcha-response');

			const recaptcha = new ReCaptcha({
				apiKey: process.env.RUCAPTCHA_CLIENT_KEY!,
				siteKey: process.env.ONLYFANS_SITE_KEY!,
				siteUrl: process.env.ONLYFANS_URL!,
				logs: true
			});

			const taskResult = await recaptcha.solve();

			await page.evaluate(() => {
				window['grecaptcha'] = {
					render: function (container, params) {
						window['callbackCopy'] = params.callback;
					}
				};
			});

			await page.evaluate(result => {
				(
					document.getElementById(
						'g-recaptcha-response'
					) as HTMLTextAreaElement
				).innerHTML = result;
			}, taskResult);

			return { email, password };
		} catch (error) {
			console.log(error);
		}
	}

	async getInfo() {}
}
