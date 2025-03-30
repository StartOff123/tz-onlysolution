import { Router } from 'express';

import { LoginDto, LoginSchema } from '~dto/login.dto';

import { validation } from '~utils/validation.util';

import { MainService } from './main.service';

class MainController {
	static readonly LOGIN = '/login';
	static readonly GET_INFO = '/getInfo';

	public router: Router = Router();
	private mainService: MainService = new MainService();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			MainController.LOGIN,
			validation(LoginSchema),
			async (req, res) => {
				const dto = req.body as LoginDto;

				res.status(200).json(await this.mainService.login(dto));
			}
		);

		this.router.get(MainController.GET_INFO, async (req, res) => {
			res.status(200).json(await this.mainService.getInfo());
		});
	}
}

export default new MainController().router;
