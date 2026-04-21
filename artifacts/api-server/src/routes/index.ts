import { Router, type IRouter } from "express";
import healthRouter from "./health";
import estimateCaloriesRouter from "./estimate-calories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(estimateCaloriesRouter);

export default router;
