import express from 'express';
import { ProtectRoute } from '../middlewares/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';
const router = express.Router();

router.get('/users', ProtectRoute, getUsersForSidebar);
router.get('/:id', ProtectRoute, getMessages);

router.post('/send/:id', ProtectRoute, sendMessage);


export default router