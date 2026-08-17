import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      const res = await API.get('/products/my-products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing? (Cloudinary images will be cleaned up)')) {
      try {
        await API.delete(`/products/${id}`);
        fetchMyListings();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleToggleSoldOut = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'AVAILABLE' : 'COMPLETED';
    try {
      await API.patch(`/products/${id}/availability`, { availability: nextStatus });
      fetchMyListings();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="page-subtitle">Rule 2: Complete student ownership control of posted items</p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          ➕ Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your listings..." />
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No products listed yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Have unused books, calculators, or hostel gear? Post your first listing!
          </p>
          <Link to="/products/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create Listing
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }} className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem' }}>Item</th>
                <th style={{ padding: '0.75rem' }}>Type</th>
                <th style={{ padding: '0.75rem' }}>Price</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={getImageUrl(p.images[0]?.url)}
                      alt={p.title}
                      style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ display: 'block' }}>{p.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.categoryId?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <Badge type={p.transactionType} />
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: '700' }}>{formatPrice(p.price)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Badge type={p.availability} text={p.availability} />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleSoldOut(p._id, p.availability)}
                        className={`btn ${p.availability === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      >
                        {p.availability === 'COMPLETED' ? 'Re-Open Listing' : 'Mark Sold Out'}
                      </button>
                      <Link to={`/products/edit/${p._id}`} className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
