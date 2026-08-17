import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const IncomingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncoming = async () => {
    try {
      const res = await API.get('/requests/incoming');
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
    fetchIncoming();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await API.patch(`/requests/${id}/${action}`);
      fetchIncoming();
    } catch (err) {
      alert(`Error performing ${action}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Incoming Product Requests</h1>
          <p className="page-subtitle">Requests received from students for your listings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/requests/incoming" className="btn btn-primary btn-sm">
            Incoming Requests
          </Link>
          <Link to="/requests/outgoing" className="btn btn-secondary btn-sm">
            Outgoing Requests
          </Link>
        </div>
      </div>

      {loading ? (
        <div>Loading incoming requests...</div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No incoming requests</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't received any buy/rent requests yet.</p>
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
                  Requester:{' '}
                  <Link to={`/profile/${r.requesterId?._id}`} style={{ fontWeight: '700', textDecoration: 'underline', color: 'var(--text-main)' }}>
                    {r.requesterId?.name}
                  </Link>{' '}
                  ({r.requesterId?.course}, {r.requesterId?.studyYear}) • 📍 {r.requesterId?.approximateLocation}{' '}
                  {r.requesterId?.status === 'ACTIVE' || r.requesterId?.isVerified ? (
                    <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>✅ Verified</span>
                  ) : (
                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>⏳ Pending</span>
                  )}
                </p>
                {r.message && (
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#444', backgroundColor: 'var(--bg-subtle)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                    "{r.message}"
                  </p>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Received: {formatDate(r.createdAt)}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleAction(r._id, 'accept')} className="btn btn-primary btn-sm">
                      Accept Request
                    </button>
                    <button onClick={() => handleAction(r._id, 'reject')} className="btn btn-secondary btn-sm">
                      Decline
                    </button>
                  </>
                )}
                {r.status === 'ACCEPTED' && (
                  <button onClick={() => handleAction(r._id, 'complete')} className="btn btn-primary btn-sm">
                    Mark Transaction Completed
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

export default IncomingRequestsPage;
