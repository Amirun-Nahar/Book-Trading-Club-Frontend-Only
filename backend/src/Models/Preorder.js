import mongoose from 'mongoose';

const PreorderSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false, // Optional for custom book preorders
    },
    // Book details for custom preorders
    bookDetails: {
      title: {
        type: String,
        trim: true,
      },
      author: {
        type: String,
        trim: true,
      },
      isbn: {
        type: String,
        trim: true,
      },
      genre: {
        type: String,
        trim: true,
      },
      language: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    // User identification
    identification: {
      type: {
        type: String,
        enum: ['nid', 'passport', 'driving_license', 'other'],
        trim: true,
      },
      number: {
        type: String,
        trim: true,
      },
    },
    // Address information
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'fulfilled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
PreorderSchema.index({ userId: 1 });
PreorderSchema.index({ status: 1 });

const Preorder = mongoose.model('Preorder', PreorderSchema);
export default Preorder;

