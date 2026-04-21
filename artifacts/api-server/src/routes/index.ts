import { Router, type IRouter } from "express";
import healthRouter from "./health";
import estimateCaloriesRouter from "./estimate-calories";
import paymentsRouter from "./payments";
import coachRouter from "./coach";

const router: IRouter = Router();

router.use(healthRouter);
router.use(estimateCaloriesRouter);
router.use(paymentsRouter);
router.use(coachRouter);

export default router;
