import express from 'express';
import { createStory, editStory, deleteStory, publishStory, likeStory, commentOnStory, getAllStories, getTrendingStories, getMyStories, getStoryById } from '../controllers/storyController.js';
import verifyToken from '../middleware/authMiddleware.js';  
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getstories',authMiddleware,getAllStories);
router.get('/trending',getTrendingStories);

// Author routes
router.post('/create', verifyToken, createStory);
router.get('/mine', verifyToken, getMyStories);
router.get('/:storyId', verifyToken, getStoryById);
router.put('/edit/:storyId', verifyToken, editStory);
router.delete('/delete/:storyId', verifyToken, deleteStory);
router.post('/publish/:storyId', verifyToken, publishStory);


// Both Author and Reader routes
router.post('/like/:storyId', verifyToken, likeStory);
router.post('/comment/:storyId', verifyToken, commentOnStory);

export default router;
