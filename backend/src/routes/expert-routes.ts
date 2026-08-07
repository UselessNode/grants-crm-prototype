import { Router } from 'express';
import { ExpertController } from '../controllers/expert-controller';
import { authMiddleware, expertMiddleware } from '../middleware/auth';

const router = Router();

// Только authMiddleware глобально, expertMiddleware — индивидуально
router.use(authMiddleware);

router.get('/expert/profile', expertMiddleware, ExpertController.profile);
router.get('/expert/applications', expertMiddleware, ExpertController.getApplications);
router.get('/expert/applications/:id', expertMiddleware, ExpertController.getApplicationDetail);
router.post('/expert/applications/:id/draft', expertMiddleware, ExpertController.saveDraft);
router.post('/expert/applications/:id/finalize', expertMiddleware, ExpertController.finalizeReview);

export default router;
