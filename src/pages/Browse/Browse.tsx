// src/pages/Browse.tsx
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UseAxiosSecure from '@/axios/UseAxiosSecure.js';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import BookCard from '@/pages/Browse/BookCard';
import { FiSearch } from 'react-icons/fi';
import { ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import notify from '@/lib/notify';

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  isbn: string;
  tags: string[];
  location: string;
  condition: string;
  exchangeType: string;
  language: string;
  genre: string;
  image: string;
};

// API shape coming from your Mongoose model
type ApiBook = {
  _id: string;
  title: string;
  author: string;
  ISBN?: string;
  Location?: string;
  Condition?: string;
  Exchange?: string;
  Language?: string;
  category: string;
  tags?: string[];
  price: number;
  description: string;
  imageUrl: string;
};

// map DB → UI
const normalize = (b: ApiBook): Book => ({
  id: b._id,
  title: b.title,
  author: b.author,
  isbn: b.ISBN ?? 'N/A',
  tags: b.tags ?? [],
  location: b.Location ?? 'Dhaka',
  condition: (b.Condition ?? 'Good').toLowerCase(),
  exchangeType: (b.Exchange ?? 'Swap').toLowerCase(),
  language: b.Language ?? 'English',
  genre: b.category ?? 'Fiction',
  image: b.imageUrl,
  price: b.price,
});

export default function Browse() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useFavorites();
  const rawQuery = (searchParams.get('query') || '').trim().toLowerCase();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [exchangeType, setExchangeType] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  // Initialize local query from URL param and keep in sync when it changes
  useEffect(() => {
    setQuery(rawQuery);
    refetch();
  }, [rawQuery]);

  const axiosSecure = UseAxiosSecure();

  const {
    data: books = [], // ✅ default to empty array
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await axiosSecure.get<ApiBook[]>('/api/books');
      return res.data;
    },
    select: (apiBooks: ApiBook[]) => apiBooks.map(normalize),
    placeholderData: keepPreviousData, // ✅ v5 replacement for keepPreviousData option
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Unique filter options
  const locations = useMemo(
    () => Array.from(new Set(books.map((b) => b.location))).filter(Boolean),
    [books]
  );
  const languages = useMemo(
    () => Array.from(new Set(books.map((b) => b.language))).filter(Boolean),
    [books]
  );
  const genres = useMemo(
    () => Array.from(new Set(books.map((b) => b.genre))).filter(Boolean),
    [books]
  );

  const results = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const filtered = books.filter((b) => {
      const haystack = `${b.title} ${b.author} ${b.isbn} ${b.tags.join(
        ' '
      )}`.toLowerCase();
      const matchesText = q.length === 0 || haystack.includes(q);
      const matchesLocation = !location || b.location === location;
      const matchesCondition = !condition || b.condition === condition;
      const matchesExchange = !exchangeType || b.exchangeType === exchangeType;
      const matchesLanguage = !language || b.language === language;
      const matchesGenre = !genre || b.genre === genre;
      return (
        matchesText &&
        matchesLocation &&
        matchesCondition &&
        matchesExchange &&
        matchesLanguage &&
        matchesGenre
      );
    });
    if (!sortOrder) return filtered;
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'desc') sorted.reverse();
    return sorted;
  }, [
    books,
    query,
    location,
    condition,
    exchangeType,
    language,
    genre,
    sortOrder,
  ]);

  const handlePreorderClick = () => {
    if (!isAuthenticated) {
      notify.error('Please log in to preorder books');
      navigate('/login');
      return;
    }
    navigate('/preorder');
  };

  if (isLoading || isFetching) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="gap-5 rounded-2xl border border-sand-200 bg-gradient-to-br from-sand-50 via-white to-leaf-50 p-8 mb-6">
          <h1 className="text-3xl font-semibold text-soil-900 tracking-tight">
            Browse Books
          </h1>
          <p className="mt-2 text-sand-700">Loading books…</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-semibold text-red-700">
            Failed to load books
          </h2>
          <p className="mt-2 text-red-600 text-sm">
            {(error as any)?.message ?? 'Please try again later.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-2xl border border-sand-200 bg-gradient-to-br from-sand-50 via-white to-leaf-50 p-8 mb-6">
        <h1 className="text-3xl font-semibold text-soil-900 tracking-tight">
          Browse Books
        </h1>
        <p className="mt-2 text-sand-700">
          Discover books available for exchange.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-subtle border border-sand-200 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-soil-900">
            <FiSearch className="w-5 h-5 text-leaf-600" />
            Search & Filter
          </h3>
          <button
            onClick={handlePreorderClick}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-leaf-600 hover:bg-leaf-700 rounded-lg transition-colors shadow-sm"
            aria-label="Preorder a book"
          >
            <ShoppingCart className="w-4 h-4" />
            Preorder Book
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm placeholder-sand-500 focus:outline-none focus:ring-2 focus:ring-leaf-300"
            placeholder="Search title, author, ISBN, or tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Any condition</option>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={exchangeType}
            onChange={(e) => setExchangeType(e.target.value)}
          >
            <option value="">All exchange types</option>
            <option value="swap">Swap</option>
            <option value="donate">Donate</option>
            <option value="sell">Sell</option>
          </select>

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">All languages</option>
            {languages.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-sm"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'asc' | 'desc' | '')
            }
          >
            <option value="">Sorting</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.length === 0 ? (
          <div className="col-span-full text-sand-700">No books found.</div>
        ) : (
          results.map((book) => <BookCard key={book.id} book={book} />)
        )}
      </div>
    </section>
  );
}
