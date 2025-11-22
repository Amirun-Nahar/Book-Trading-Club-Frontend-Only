import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    ISBN: {
      type: String,
      default: 'N/A',
    },
    Location: {
      type: String,
      default: 'Dhaka',
    },
    Condition: {
      type: String,
      default: 'Good',
    },
    Exchange: {
      type: String,
      default: 'Swap',
    },
    Language: {
      type: String,
      default: 'English',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true, // since Cloudinary upload always provides a URL
    },
    uid: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', BookSchema);
export default Book;
