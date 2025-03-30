import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import { General } from '~types/general';

import mainController from './main.controller';

function bootstrap() {
	dotenv.config();

	const port = process.env.APP_PORT || 8081;

	const app: Express = express();
	app.use(express.json());

	app.use('/', mainController);

	app.use(
		(
			err: HttpError,
			req: Request,
			res: Response<General.Error>,
			next: NextFunction
		) => {
			console.log(err);
			res.status(err.statusCode).json({
				statusCode: err.statusCode,
				status: err.name,
				message: err.message
			});
		}
	);

	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
}

bootstrap();
