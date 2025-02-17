import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,  
  }, 
  published: {
    type: Boolean,
    default: false, 
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [  
    {
      type: String,
    }
  ],
});

// Static method to count stories by author
storySchema.statics.countStoriesByAuthor = function(authorId) {
  return this.countDocuments({ author: authorId });
};
const Story = mongoose.model('Story', storySchema);

export default Story;


