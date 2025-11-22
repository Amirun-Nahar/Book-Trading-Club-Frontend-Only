import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/firebase/useAuth';
import { preorderApi, type CreatePreorderRequest } from '@/services/preorderApi';
import notify from '@/lib/notify';
import Loader2 from '@/components/Loaders/Loader2';
import { ArrowLeft, BookOpen, User, Mail, Phone, MapPin, MessageSquare, IdCard } from 'lucide-react';

export default function Preorder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();

  const [formData, setFormData] = useState({
    // Book Details
    bookTitle: '',
    bookAuthor: '',
    bookISBN: '',
    bookGenre: '',
    bookLanguage: '',
    bookDescription: '',
    // User Information
    phone: '',
    // Identification
    identificationType: '',
    identificationNumber: '',
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    // Additional
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !dbUser) {
      notify.error('Please log in to preorder books');
      navigate('/login');
    }
  }, [user, dbUser, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !dbUser) {
      notify.error('Missing required information');
      return;
    }

    // Validate required fields
    if (!formData.bookTitle || !formData.bookAuthor) {
      notify.error('Please provide book title and author');
      return;
    }

    if (!formData.identificationType || !formData.identificationNumber) {
      notify.error('Please provide identification details');
      return;
    }

    if (!formData.street || !formData.city || !formData.country) {
      notify.error('Please provide complete address information');
      return;
    }

    setIsSubmitting(true);

    try {
      const preorderData: CreatePreorderRequest = {
        bookId: id || undefined, // Optional if coming from a specific book
        bookDetails: {
          title: formData.bookTitle,
          author: formData.bookAuthor,
          isbn: formData.bookISBN || undefined,
          genre: formData.bookGenre || undefined,
          language: formData.bookLanguage || undefined,
          description: formData.bookDescription || undefined,
        },
        userId: user.uid,
        userEmail: user.email || '',
        userName: dbUser.displayName || user.displayName || 'Unknown User',
        identification: {
          type: formData.identificationType as 'nid' | 'passport' | 'driving_license' | 'other',
          number: formData.identificationNumber,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country,
        },
        contactInfo: {
          phone: formData.phone || undefined,
        },
        notes: formData.notes || undefined,
      };

      await preorderApi.createPreorder(preorderData);
      notify.success('Preorder placed successfully!');
      navigate('/preorders');
    } catch (error: any) {
      console.error('Error creating preorder:', error);
      notify.error(error.message || 'Failed to place preorder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !dbUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sand-700 hover:text-soil-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-semibold text-soil-900 tracking-tight">
          Preorder Book
        </h1>
        <p className="mt-2 text-sand-700">
          Fill in the details of the book you want to preorder and your information
        </p>
      </div>

      <div className="rounded-xl border border-sand-200 bg-white p-6 md:p-8 shadow-subtle">
        {/* User Info Display */}
        <div className="mb-6 p-4 bg-sand-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-sand-600" />
            <span className="text-sand-600">Name:</span>
            <span className="text-soil-900 font-medium">
              {dbUser.displayName || user.displayName || 'Unknown User'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-sand-600" />
            <span className="text-sand-600">Email:</span>
            <span className="text-soil-900 font-medium">{user.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Book Details Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-leaf-600" />
              <h2 className="text-lg font-semibold text-soil-900">Book Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bookTitle" className="block text-sm font-medium text-soil-900 mb-2">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter book title"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="bookAuthor" className="block text-sm font-medium text-soil-900 mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bookAuthor"
                  name="bookAuthor"
                  value={formData.bookAuthor}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter author name"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="bookISBN" className="block text-sm font-medium text-soil-900 mb-2">
                  ISBN (Optional)
                </label>
                <input
                  type="text"
                  id="bookISBN"
                  name="bookISBN"
                  value={formData.bookISBN}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="bookGenre" className="block text-sm font-medium text-soil-900 mb-2">
                  Genre (Optional)
                </label>
                <input
                  type="text"
                  id="bookGenre"
                  name="bookGenre"
                  value={formData.bookGenre}
                  onChange={handleInputChange}
                  placeholder="e.g., Fiction, Non-fiction"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="bookLanguage" className="block text-sm font-medium text-soil-900 mb-2">
                  Language (Optional)
                </label>
                <input
                  type="text"
                  id="bookLanguage"
                  name="bookLanguage"
                  value={formData.bookLanguage}
                  onChange={handleInputChange}
                  placeholder="e.g., English, Bangla"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="bookDescription" className="block text-sm font-medium text-soil-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="bookDescription"
                  name="bookDescription"
                  value={formData.bookDescription}
                  onChange={handleInputChange}
                  placeholder="Any additional details about the book..."
                  rows={3}
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-leaf-600" />
              <h2 className="text-lg font-semibold text-soil-900">Contact Information</h2>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-soil-900 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
              />
            </div>
          </div>

          {/* Identification Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <IdCard className="w-5 h-5 text-leaf-600" />
              <h2 className="text-lg font-semibold text-soil-900">Identification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="identificationType" className="block text-sm font-medium text-soil-900 mb-2">
                  ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="identificationType"
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-300"
                >
                  <option value="">Select ID Type</option>
                  <option value="nid">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="identificationNumber" className="block text-sm font-medium text-soil-900 mb-2">
                  ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="identificationNumber"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter ID number"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-leaf-600" />
              <h2 className="text-lg font-semibold text-soil-900">Delivery Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-soil-900 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter street address"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-soil-900 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter city"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-soil-900 mb-2">
                  State/Province (Optional)
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state or province"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-soil-900 mb-2">
                  ZIP/Postal Code (Optional)
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP or postal code"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-soil-900 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter country"
                  className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-leaf-600" />
              <h2 className="text-lg font-semibold text-soil-900">Additional Notes</h2>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-soil-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special requests or additional information..."
                rows={4}
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 text-sm font-medium text-soil-900 bg-white border border-sand-300 rounded-lg hover:bg-sand-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-leaf-600 rounded-lg hover:bg-leaf-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 />
                  Placing Preorder...
                </>
              ) : (
                'Place Preorder'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
