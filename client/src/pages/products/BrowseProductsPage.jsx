import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BrowseProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [transactionType, setTransactionType] = useState(searchParams.get('type') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    API.get('/categories').then((res) => setCategories(res.data.data));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: searchParams.get('page') || 1,
        limit: 12,
        sort,
      });

      if (search) query.append('q', search);
      if (selectedCategory) query.append('category', selectedCategory);
      if (transactionType) query.append('type', transactionType);
      if (condition) query.append('condition', condition);

      const res = await API.get(`/products?${query.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sort]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.q = search;
    if (selectedCategory) params.category = selectedCategory;
    if (transactionType) params.type = transactionType;
    if (condition) params.condition = condition;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setTransactionType('');
    setCondition('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle">Exclusively for KITCOEK Students</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        {/* Sidebar Filters */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Filters</h3>

          <form onSubmit={handleFilterSubmit}>
            <div className="form-group">
              <label className="form-label">Search Keyword</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type (SELL / RENT)</label>
              <select
                className="form-select"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="SELL">SELL</option>
                <option value="RENT">RENT</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">All Conditions</option>
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="USED">Used</option>
                <option value="HEAVILY_USED">Heavily Used</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginBottom: '0.5rem' }}>
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary btn-full btn-sm"
            >
              Clear All
            </button>
          </form>
        </div>

        {/* Product Grid Header & Content */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing {products.length} of {pagination.total || 0} listings
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.6rem' }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading marketplace products..." />
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No matching products found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Try adjusting your search query or clear active filters.
              </p>
            </div>
          ) : (
            <div className="grid-products">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProductsPage;
