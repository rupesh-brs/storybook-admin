import Story from '../models/storyModel.js';

// Create a new story (Author only)
export const createStory = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id; 
  
  if (req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to create a story." });
  }

  const newStory = new Story({
    author: userId,
    title,
    content,
  });

  try {
    await newStory.save();
    return res.status(201).json({ message: "Story created successfully.", story: newStory });
  } catch (error) {
    return res.status(500).json({ message: "Error creating story", error });
  }
};

// Get a single story by ID
export const getStoryById = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user.id;

  try {
    const story = await Story.findOne({ _id: storyId, author: userId });

    if (!story) {
      return res.status(404).json({ message: "Story not found or you're not the author." });
    }

    return res.status(200).json(story);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching story", error });
  }
};


// Edit a story (Author only)
export const editStory = async (req, res) => {
  const { storyId } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id; 

  if (req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to edit this story." });
  }

  try {
    const story = await Story.findOne({ _id: storyId, author: userId });

    if (!story) {
      return res.status(404).json({ message: "Story not found or you're not the author." });
    }

    story.title = title || story.title;
    story.content = content || story.content;

    await story.save();
    return res.status(200).json({ message: "Story updated successfully.", story });
  } catch (error) {
    return res.status(500).json({ message: "Error editing story", error });
  }
};

// Delete a story (Author only)
export const deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user.id; 

  if (req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to delete this story." });
  }

  try {
    const story = await Story.findOneAndDelete({ _id: storyId, author: userId });

    if (!story) {
      return res.status(404).json({ message: "Story not found or you're not the author." });
    }

    return res.status(200).json({ message: "Story deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting story", error });
  }
};

// Publish a story (Author only)
export const publishStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user.id; 

  if (req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to publish this story." });
  }

  try {
    const story = await Story.findOne({ _id: storyId, author: userId });

    if (!story) {
      return res.status(404).json({ message: "Story not found or you're not the author." });
    }

    story.published = true;
    await story.save();
    return res.status(200).json({ message: "Story published successfully.", story });
  } catch (error) {
    return res.status(500).json({ message: "Error publishing story", error });
  }
};

// Get stories of the logged-in author
export const getMyStories = async (req, res) => {
  const userId = req.user.id;

  try {
    const stories = await Story.find({ author: userId });
    return res.status(200).json({ stories });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stories', error });
  }
};
// Get all stories
export const getAllStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ published: true }).populate('author', 'name email');
    console.log("Fetched stories:", stories); // Log the fetched stories

    if (!stories || stories.length === 0) {
      return res.status(404).json({ message: "No stories found." });
    }

    return res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error); 
    return next(error);
  }
};

// Get trending stories (highest likes)
export const getTrendingStories = async (req, res) => {
  try {
    const trendingStories = await Story.find({ published: true })
      .sort({ likes: -1 }) 
      .populate('author', 'name email') 
      .limit(5); 

    if (!trendingStories || trendingStories.length === 0) {
      return res.status(404).json({ message: "No trending stories found." });
    }

    return res.status(200).json({ trendingStories });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching trending stories", error });
  }
};


// Like a story 
export const likeStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id; // Assuming the user ID is available in req.user

  // Check if the user has the right role to like the story
  if (req.user.role !== 'reader' && req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to like this story." });
  }

  try {
    // Find the story by its ID
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Check if the user has already liked this story
    if (story.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this story." });
    }

    // Add the user ID to the likedBy array and increment the like count
    story.likedBy.push(userId);
    story.likes += 1;

    // Save the updated story
    await story.save();

    return res.status(200).json({ message: "Story liked successfully.", story });
  } catch (error) {
    return res.status(500).json({ message: "Only Single Like is allowed!", error });
  }
};



// Comment on a story
export const commentOnStory = async (req, res) => {
  const { storyId } = req.params;
  const { comment } = req.body;

  if (req.user.role !== 'reader' && req.user.role !== 'author') {
    return res.status(403).json({ message: "You are not authorized to comment on this story." });
  }

  try {
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    story.comments.push(comment);
    await story.save();
    return res.status(200).json({ message: "Comment added successfully.", story });
  } catch (error) {
    return res.status(500).json({ message: "Error commenting on story", error });
  }
};
