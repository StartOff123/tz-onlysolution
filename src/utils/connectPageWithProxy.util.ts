import puppeteer, { Page } from 'puppeteer';

interface Proxy {
	ip: string;
	port: number;
	username: string;
	password: string;
}

export async function connectPageWithProxy(proxy: Proxy): Promise<Page> {
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--proxy-server=${proxy.ip}:${proxy.port}`]
	});

	const page = await browser.newPage();

	await page.authenticate({
		username: proxy.username,
		password: proxy.password
	});

	return page;
}
