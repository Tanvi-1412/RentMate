import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?limit=8&sort=newest'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data);
        if (prodRes.data.success) setRecentProducts(prodRes.data.data.products);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.2rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
          }}
        >
          Welcome to RentMate, {currentUser?.name?.split(' ')[0]}! 👋
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '650px',
            margin: '0 auto 1.5rem',
          }}
        >
          The official KITCOEK student marketplace. Sell unused items, rent academic & hostel gear, or find what you need at student-friendly prices.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            maxWidth: '540px',
            margin: '0 auto 1.5rem',
            gap: '0.5rem',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Search scientific calculators, books, cycles, tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
          />
          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/products/add" className="btn btn-primary">
            ➕ List an Item to Sell/Rent
          </Link>
          <Link to="/products" className="btn btn-secondary">
            📦 Browse All Listings
          </Link>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>
          Explore Categories
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)',
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Added Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Recently Added at KITCOEK</h2>
          <Link to="/products" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>
            View All →
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p>No listings added yet. Be the first KITCOEK student to post!</p>
            <Link to="/products/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid-products">
            {recentProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
