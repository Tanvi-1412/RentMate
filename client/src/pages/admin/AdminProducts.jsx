import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/admin/products');
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Admin action: Permanently remove this product and clean Cloudinary images?')) {
      try {
        await API.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Error removing product');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Product Moderation</h1>
          <p className="page-subtitle">Inspect & remove inappropriate or fake student listings</p>
        </div>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div style={{ overflowX: 'auto' }} className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem' }}>Listing</th>
                <th style={{ padding: '0.75rem' }}>Seller</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{p.price}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{p.ownerId?.name}</td>
                  <td style={{ padding: '0.75rem' }}>{p.categoryId?.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Badge type={p.transactionType} />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm">
                      Remove Listing
                    </button>
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

export default AdminProducts;
