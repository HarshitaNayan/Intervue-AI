import { Router } from 'express';
import multer from 'multer';
import { startInterview, submitAnswer, endInterview, uploadResume, getReport, introFollowUp } from '../controllers/interviewController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

const router = Router();

router.post('/intro-followup', introFollowUp);
router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.post('/end', endInterview);
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/report', getReport);

export default router;
