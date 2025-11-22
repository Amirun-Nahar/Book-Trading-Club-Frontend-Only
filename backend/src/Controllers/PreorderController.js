import Preorder from '../Models/Preorder.js';
import Book from '../Models/Book.js';

// Create a new preorder
export const CreatePreorder = async (req, res) => {
  try {
    const {
      bookId,
      bookDetails,
      userId,
      userEmail,
      userName,
      identification,
      address,
      contactInfo,
      notes,
    } = req.body;

    if (!userId || !userEmail || !userName) {
      return res.status(400).json({
        message: 'User ID, Email, and Name are required',
      });
    }

    // If bookId is provided, verify the book exists
    if (bookId) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Check if user already has a pending preorder for this book
      const existingPreorder = await Preorder.findOne({
        bookId,
        userId,
        status: 'pending',
      });

      if (existingPreorder) {
        return res.status(400).json({
          message: 'You already have a pending preorder for this book',
        });
      }
    }

    // If bookDetails are provided, validate required fields
    if (!bookId && bookDetails) {
      if (!bookDetails.title || !bookDetails.author) {
        return res.status(400).json({
          message: 'Book title and author are required for custom preorders',
        });
      }
    }

    const newPreorder = new Preorder({
      bookId: bookId || null,
      bookDetails: bookDetails || {},
      userId,
      userEmail,
      userName,
      identification: identification || {},
      address: address || {},
      contactInfo: contactInfo || {},
      notes: notes || '',
    });

    await newPreorder.save();

    // Populate book details for response if bookId exists
    if (bookId) {
      await newPreorder.populate('bookId');
    }

    res.status(201).json({
      message: 'Preorder created successfully',
      preorder: newPreorder,
    });
  } catch (error) {
    console.error('Error in CreatePreorder:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all preorders for a user
export const GetUserPreorders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const preorders = await Preorder.find({ userId })
      .populate('bookId')
      .sort({ createdAt: -1 });
    
    // Handle cases where bookId might be null
    const preordersWithBookInfo = preorders.map((preorder) => {
      const preorderObj = preorder.toObject();
      if (!preorderObj.bookId && preorderObj.bookDetails) {
        // Use bookDetails if bookId doesn't exist
        preorderObj.bookId = {
          _id: null,
          title: preorderObj.bookDetails.title,
          author: preorderObj.bookDetails.author,
          imageUrl: '',
          price: 0,
          ISBN: preorderObj.bookDetails.isbn,
          category: preorderObj.bookDetails.genre,
          description: preorderObj.bookDetails.description,
        };
      }
      return preorderObj;
    });
    
    res.status(200).json(preordersWithBookInfo);
  } catch (error) {
    console.error('Error in GetUserPreorders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all preorders for a book (for sellers)
export const GetBookPreorders = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const preorders = await Preorder.find({ bookId })
      .populate('bookId')
      .sort({ createdAt: -1 });

    res.status(200).json(preorders);
  } catch (error) {
    console.error('Error in GetBookPreorders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get a single preorder by ID
export const GetPreorderById = async (req, res) => {
  try {
    const { id } = req.params;

    const preorder = await Preorder.findById(id).populate('bookId');

    if (!preorder) {
      return res.status(404).json({ message: 'Preorder not found' });
    }

    res.status(200).json(preorder);
  } catch (error) {
    console.error('Error in GetPreorderById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update preorder status
export const UpdatePreorderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const preorder = await Preorder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('bookId');

    if (!preorder) {
      return res.status(404).json({ message: 'Preorder not found' });
    }

    res.status(200).json({
      message: 'Preorder status updated successfully',
      preorder,
    });
  } catch (error) {
    console.error('Error in UpdatePreorderStatus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete/Cancel a preorder
export const DeletePreorder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Optional: verify user owns the preorder

    const preorder = await Preorder.findById(id);

    if (!preorder) {
      return res.status(404).json({ message: 'Preorder not found' });
    }

    // Optional: Verify user owns the preorder
    if (userId && preorder.userId !== userId) {
      return res.status(403).json({
        message: 'You do not have permission to delete this preorder',
      });
    }

    await Preorder.findByIdAndDelete(id);

    res.status(200).json({ message: 'Preorder deleted successfully' });
  } catch (error) {
    console.error('Error in DeletePreorder:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

