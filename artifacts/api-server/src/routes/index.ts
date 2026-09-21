import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publicationsRouter from "./publications";
import adminRouter from "./admin";
import endorsementsRouter from "./endorsements";
import adminContentRouter from "./adminContent";
import enquiriesRouter from "./enquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(publicationsRouter);
router.use(endorsementsRouter);
router.use(adminContentRouter);
router.use(enquiriesRouter);

export default router;
