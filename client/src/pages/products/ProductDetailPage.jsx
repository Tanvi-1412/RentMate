import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API, { formatApiError } from '../../services/api';
import Badge from '../../components/common/Badge';
import { formatPrice, formatDate, getImageUrl } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusAlert from '../../components/common/StatusAlert';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [requestMsg, setRequestMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [showReportModal, setShowReportModal] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/products/${id}`),
        ]);

        if (prodRes.data.success) setProduct(prodRes.data.data);
        if (revRes.data.success) setReviews(revRes.data.data);
      } catch (err) {
        setStatusInfo(formatApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading product details..." fullScreen />;
  if (!product) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <StatusAlert
          status={404}
          title="Listing Not Found"
          description="The requested listing could not be found or may have been removed."
        />
        <div style={{ textAlign: 'center' }}>
          <Link to="/products" className="btn btn-primary">Browse Marketplace Listings</Link>
        </div>
      </div>
    );
  }

  const ownerIdStr = (product.ownerId?._id || product.ownerId?.id || product.ownerId)?.toString();
  const currentUserIdStr = (currentUser?.id || currentUser?._id)?.toString();
  const isOwner = Boolean(ownerIdStr && currentUserIdStr && ownerIdStr === currentUserIdStr);

  const requestButtonText = product.transactionType === 'SELL' ? 'Send Buy Request' : 'Send Rent Request';

  const handleSendRequest = async () => {
    setSubmittingReq(true);
    setStatusInfo(null);
    try {
      const requestType = product.transactionType === 'SELL' ? 'BUY' : 'RENT';
      const res = await API.post('/requests', {
        productId: product._id,
        requestType,
        message: requestMsg,
      });

      if (res.data.success) {
        navigate('/requests/outgoing');
      }
    } catch (err) {
      setStatusInfo(formatApiError(err));
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await API.post('/conversations', {
        sellerId: product.ownerId._id,
        productId: product._id,
      });

      if (res.data.success) {
        navigate(`/messages/${res.data.data._id}`);
      }
    } catch (err) {
      alert('Failed to start chat session');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reports', {
        targetType: 'PRODUCT',
        targetId: product._id,
        reason: reportReason,
      });
      alert('Report submitted to Admin for review');
      setShowReportModal(false);
    } catch (err) {
      alert('Error submitting report');
    }
  };

  const imagesList = product.images || [];

  const handleToggleSoldOut = async () => {
    try {
      const newAvailability = product.availability === 'COMPLETED' ? 'AVAILABLE' : 'COMPLETED';
      const res = await API.patch(`/products/${product._id}/availability`, { availability: newAvailability });
      if (res.data.success) {
        setProduct((prev) => ({ ...prev, availability: newAvailability }));
        alert(`Listing status updated to ${newAvailability === 'COMPLETED' ? 'SOLD OUT' : 'AVAILABLE'}`);
      }
    } catch (err) {
      alert('Failed to update listing status');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {statusInfo && (
        <StatusAlert
          status={statusInfo.status}
          title={statusInfo.title}
          description={statusInfo.description}
          onClose={() => setStatusInfo(null)}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="card">
        {/* Gallery */}
        <div>
          <div
            style={{
              width: '100%',
              paddingTop: '75%',
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#F5F5F5',
              marginBottom: '1rem',
            }}
          >
            <img
              src={getImageUrl(imagesList[selectedImg]?.url)}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=RentMate+Product';
              }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {imagesList.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img.url)}
                alt="thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Thumb';
                }}
                onClick={() => setSelectedImg(idx)}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: selectedImg === idx ? '2px solid var(--primary-dark)' : '1px solid var(--border-medium)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Badge type={product.transactionType} />
            <Badge type={product.availability} text={product.availability === 'COMPLETED' ? '🏷️ SOLD OUT' : product.availability} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>{product.title}</h1>

          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
            {formatPrice(product.price)}
            {product.transactionType === 'RENT' && product.rentalPeriod && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> /{product.rentalPeriod}</span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem' }}>
              Condition: <strong>{product.condition?.replace('_', ' ')}</strong>
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Location: <strong>📍 {product.approximateLocation} (Rule 6 Protected)</strong>
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Posted By:{' '}
              <Link to={`/profile/${product.ownerId?._id}`} style={{ fontWeight: '700', color: 'var(--text-main)', textDecoration: 'underline' }}>
                {product.ownerId?.name}
              </Link>{' '}
              ({product.ownerId?.course}, {product.ownerId?.studyYear}){' '}
              {product.ownerId?.status === 'ACTIVE' || product.ownerId?.isVerified ? (
                <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                  ✅ Verified Student
                </span>
              ) : (
                <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                  ⏳ Pending Verification
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          {isOwner ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleToggleSoldOut}
                className={`btn ${product.availability === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'} btn-full`}
              >
                {product.availability === 'COMPLETED' ? '✅ Re-Open as Available' : '🏷️ Mark as Sold Out'}
              </button>
              <button onClick={() => navigate(`/products/edit/${product._id}`)} className="btn btn-secondary btn-full">
                ✏️ Edit Listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.availability === 'AVAILABLE' ? (
                <div>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Optional message to seller (e.g. When can we meet near hostel?)"
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <button
                    onClick={handleSendRequest}
                    disabled={submittingReq}
                    className="btn btn-primary btn-full"
                  >
                    {submittingReq ? 'Sending Request...' : requestButtonText}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                  }}
                >
                  <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>
                    🏷️ THIS ITEM IS SOLD OUT
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    This item has been marked as sold out by the seller. It remains visible in the marketplace for reference.
                  </span>
                </div>
              )}

              <button onClick={handleStartChat} className="btn btn-secondary btn-full">
                💬 Chat with Seller
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                🚩 Report Inappropriate Listing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Report Listing</h3>
            <form onSubmit={handleReportSubmit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select className="form-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="Fake listing">Fake listing</option>
                  <option value="Wrong information">Wrong information</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Scam/suspicious behavior">Scam/suspicious behavior</option>
                  <option value="Prohibited item">Prohibited item</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-danger btn-full">Submit Report</button>
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary btn-full">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
