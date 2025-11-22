import Book from '../Models/Book.js';

export const GetAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in GetAllBooks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const GetBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error in GetBookById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const CreateBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      ISBN,
      Location,
      Condition,
      Exchange,
      Language,
      tags,
      price,
      description,
      imageUrl,
      uid,
    } = req.body;
    if (
      !uid ||
      !title ||
      !author ||
      !category ||
      !price ||
      !description ||
      !imageUrl ||
      !ISBN ||
      !Location ||
      !Condition ||
      !Exchange ||
      !Language ||
      !tags
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newBook = new Book({
      title,
      author,
      category,
      price,
      description,
      imageUrl,
      uid,
      ISBN,
      Location,
      Condition,
      Exchange,
      Language,
      tags,
    });
    await newBook.save();
    res
      .status(201)
      .json({ message: 'Book Created Successfully', book: newBook });
  } catch (error) {
    console.error('Error in CreateBook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateBook = (req, res) => {
  const { id } = req.params;
  const body = req.body;
  res
    .status(201)
    .json({ message: `Book Put request working for id: ${id}`, body: body });
};

export const DeleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const BookDelete = await Book.findByIdAndDelete(id);
    if (!BookDelete) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book Deleted Successfully' });
  } catch (error) {
    console.error('Error in DeleteBook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
