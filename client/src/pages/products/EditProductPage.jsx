import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'GOOD',
    availability: 'AVAILABLE',
    approximateLocation: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/products/${id}`).then((res) => {
      if (res.data.success) {
        const p = res.data.data;
        setFormData({
          title: p.title,
          description: p.description,
          price: p.price,
          condition: p.condition,
          availability: p.availability,
          approximateLocation: p.approximateLocation,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/products/${id}`, formData);
      if (res.data.success) {
        alert('Listing updated successfully!');
        navigate(`/products/${id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product');
    }
  };

  if (loading) return <div>Loading details...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }} className="card">
      <h2>Edit Listing</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Price (₹)</label>
          <input
            type="number"
            className="form-input"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Availability Status</label>
          <select
            className="form-select"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
