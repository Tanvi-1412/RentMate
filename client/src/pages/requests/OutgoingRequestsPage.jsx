import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const OutgoingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutgoing = async () => {
    try {
      const res = await API.get('/requests/outgoing');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutgoing();
  }, []);

  const handleCancel = async (id) => {
    try {
      await API.patch(`/requests/${id}/cancel`);
      fetchOutgoing();
    } catch (err) {
      alert('Error cancelling request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Outgoing Requests</h1>
          <p className="page-subtitle">Track status of buy/rent requests you sent to other students</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/requests/incoming" className="btn btn-secondary btn-sm">
            Incoming Requests
          </Link>
          <Link to="/requests/outgoing" className="btn btn-primary btn-sm">
            Outgoing Requests
          </Link>
        </div>
      </div>

      {loading ? (
        <div>Loading outgoing requests...</div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No outgoing requests</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't requested any products yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((r) => (
            <div key={r._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Badge type={r.requestType} />
                  <Badge type={r.status} text={r.status} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{r.productId?.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                  Seller:{' '}
                  <Link to={`/profile/${r.sellerId?._id}`} style={{ fontWeight: '700', textDecoration: 'underline', color: 'var(--text-main)' }}>
                    {r.sellerId?.name}
                  </Link>{' '}
                  ({r.sellerId?.course}) • 📍 {r.sellerId?.approximateLocation}{' '}
                  {r.sellerId?.status === 'ACTIVE' || r.sellerId?.isVerified ? (
                    <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>✅ Verified</span>
                  ) : (
                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>⏳ Pending</span>
                  )}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent: {formatDate(r.createdAt)}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/products/${r.productId?._id}`} className="btn btn-secondary btn-sm">
                  View Item
                </Link>
                {r.status === 'PENDING' && (
                  <button onClick={() => handleCancel(r._id)} className="btn btn-danger btn-sm">
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutgoingRequestsPage;
