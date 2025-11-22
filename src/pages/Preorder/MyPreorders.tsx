import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/firebase/useAuth';
import { preorderApi } from '@/services/preorderApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notify from '@/lib/notify';
import Loader2 from '@/components/Loaders/Loader2';
import { BookOpen, Calendar, MapPin, Phone, Trash2, Eye } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  fulfilled: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export default function MyPreorders() {
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch user preorders
  const {
    data: preorders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preorders', user?.uid],
    queryFn: () => {
      if (!user?.uid) return [];
      return preorderApi.getUserPreorders(user.uid);
    },
    enabled: !!user?.uid,
  });

  // Delete preorder mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => preorderApi.deletePreorder(id, user?.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preorders', user?.uid] });
      notify.success('Preorder cancelled successfully');
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to cancel preorder');
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !dbUser) {
      notify.error('Please log in to view your preorders');
      navigate('/login');
    }
  }, [user, dbUser, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this preorder?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const filteredPreorders = preorders.filter((preorder) => {
    if (filterStatus === 'all') return true;
    return preorder.status === filterStatus;
  });

  if (!user || !dbUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-semibold text-red-700">
            Failed to load preorders
          </h2>
          <p className="mt-2 text-red-600 text-sm">
            Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-soil-900 tracking-tight">
          My Preorders
        </h1>
        <p className="mt-2 text-sand-700">
          Manage your book preorders
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 rounded-xl bg-white p-4 border border-sand-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-soil-900">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-300"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Preorders List */}
      {filteredPreorders.length === 0 ? (
        <div className="rounded-xl border border-sand-200 bg-white p-12 text-center">
          <BookOpen className="w-16 h-16 text-sand-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-soil-900 mb-2">
            No preorders found
          </h3>
          <p className="text-sand-700 mb-6">
            {filterStatus === 'all'
              ? "You haven't placed any preorders yet."
              : `No preorders with status "${statusLabels[filterStatus as keyof typeof statusLabels]}".`}
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-2 bg-leaf-600 text-white rounded-lg hover:bg-leaf-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPreorders.map((preorder) => (
            <div
              key={preorder._id}
              className="rounded-xl border border-sand-200 bg-white p-6 shadow-subtle hover:shadow-md transition-shadow"
            >
              {/* Book Image */}
              {preorder.bookId && preorder.bookId.imageUrl && (
                <div className="h-32 w-full overflow-hidden rounded-lg bg-sand-100 mb-4">
                  <img
                    src={preorder.bookId.imageUrl}
                    alt={preorder.bookId.title || 'Book'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {(!preorder.bookId || !preorder.bookId.imageUrl) && (
                <div className="h-32 w-full flex items-center justify-center rounded-lg bg-sand-100 mb-4">
                  <BookOpen className="w-12 h-12 text-sand-400" />
                </div>
              )}

              {/* Book Title */}
              <h3 className="font-semibold text-soil-900 mb-1 line-clamp-2">
                {preorder.bookId?.title || preorder.bookDetails?.title || 'Custom Book'}
              </h3>
              <p className="text-sm text-sand-700 mb-3">
                by {preorder.bookId?.author || preorder.bookDetails?.author || 'Unknown Author'}
              </p>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[preorder.status]
                  }`}
                >
                  {statusLabels[preorder.status]}
                </span>
              </div>

              {/* Order Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-sand-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(preorder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {preorder.contactInfo?.phone && (
                  <div className="flex items-center gap-2 text-sand-600">
                    <Phone className="w-4 h-4" />
                    <span>{preorder.contactInfo.phone}</span>
                  </div>
                )}
                {preorder.address && (
                  <div className="flex items-start gap-2 text-sand-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="line-clamp-2">
                      {[
                        preorder.address.street,
                        preorder.address.city,
                        preorder.address.state,
                        preorder.address.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-sand-200">
                {preorder.bookId?._id && (
                  <button
                    onClick={() => navigate(`/book/${preorder.bookId!._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Book
                  </button>
                )}
                {preorder.status === 'pending' && (
                  <button
                    onClick={() => handleDelete(preorder._id)}
                    disabled={deleteMutation.isPending}
                    className={`${preorder.bookId?._id ? '' : 'flex-1'} flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50`}
                    aria-label="Cancel preorder"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

