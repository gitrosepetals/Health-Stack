import { Router } from 'express';
import { adminAuthRouter } from './auth';
import { adminArticlesRouter } from './articles';

export const adminRouter = Router();

adminRouter.use('/auth', adminAuthRouter);
adminRouter.use('/articles', adminArticlesRouter);
