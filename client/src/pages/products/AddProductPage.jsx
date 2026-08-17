import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { formatApiError } from '../../services/api';
import ImageUploader from '../../components/product/ImageUploader';
import StatusAlert from '../../components/common/StatusAlert';

const AddProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    condition: 'GOOD',
    transactionType: 'SELL',
    price: '',
    rentalPeriod: 'per day',
    securityDeposit: '0',
    approximateLocation: 'Near KITCOEK, Kolhapur',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    API.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data.data[0]._id }));
        }
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusInfo(null);

    if (files.length === 0) {
      return setStatusInfo({
        status: 400,
        title: 'Image Required',
        description: 'Please upload at least 1 photo of your item before posting.',
      });
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      files.forEach((file) => {
        data.append('images', file);
      });

      const res = await API.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate('/products/my-products');
      }
    } catch (err) {
      setStatusInfo(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="card">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Add your Product</h1>
          <p className="page-subtitle">Sell or Rent unused items to KITCOEK peers</p>
        </div>
      </div>

      {statusInfo && (
        <StatusAlert
          status={statusInfo.status}
          title={statusInfo.title}
          description={statusInfo.description}
          onClose={() => setStatusInfo(null)}
        />
      )}



      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Product Title *</label>
          <input
            type="text"
            name="title"
            required
            className="form-input"
            placeholder="e.g. Casio FX-991EX Scientific Calculator"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="categoryId"
              className="form-select"
              value={formData.categoryId}
              onChange={handleChange}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Type (Rule 4) *</label>
            <select
              name="transactionType"
              className="form-select"
              value={formData.transactionType}
              onChange={handleChange}
            >
              <option value="SELL">SELL</option>
              <option value="RENT">RENT</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              {formData.transactionType === 'RENT' ? 'Rental Price (₹) *' : 'Selling Price (₹) *'}
            </label>
            <input
              type="number"
              name="price"
              required
              min={0}
              className="form-input"
              placeholder="e.g. 500"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          {formData.transactionType === 'RENT' && (
            <div className="form-group">
              <label className="form-label">Rental Period</label>
              <select
                name="rentalPeriod"
                className="form-select"
                value={formData.rentalPeriod}
                onChange={handleChange}
              >
                <option value="per day">per day</option>
                <option value="per week">per week</option>
                <option value="per month">per month</option>
                <option value="per semester">per semester</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Condition *</label>
            <select
              name="condition"
              className="form-select"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="USED">Used</option>
              <option value="HEAVILY_USED">Heavily Used</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Approximate Location (Rule 6) *</label>
            <input
              type="text"
              name="approximateLocation"
              required
              className="form-input"
              placeholder="e.g. Near KITCOEK Main Gate"
              value={formData.approximateLocation}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            className="form-textarea"
            placeholder="Describe working condition, included accessories, or rental terms..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Real Images Upload component */}
        <ImageUploader files={files} setFiles={setFiles} maxFiles={3} />

        <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>
          {loading ? 'Uploading Images & Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
