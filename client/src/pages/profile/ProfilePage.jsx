import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/product/ProductCard';

const ProfilePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = id || currentUser?.id || currentUser?._id;
  const isOwnProfile = !id || id === currentUser?.id || id === currentUser?._id;

  useEffect(() => {
    if (targetUserId) {
      setLoading(true);
      API.get(`/users/${targetUserId}`).then((res) => {
        if (res.data.success) {
          setProfileData(res.data.data);
        }
        setLoading(false);
      });
    }
  }, [targetUserId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading student profile...</div>;

  const { user, activeListings, reviews, stats } = profileData || {};

  const isVerifiedStudent = user?.status === 'ACTIVE' || user?.isVerified;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: '800',
          }}
        >
          {user?.name?.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user?.name}</h2>
                {isVerifiedStudent ? (
                  <span className="badge badge-available" style={{ fontSize: '0.75rem' }}>
                    ✅ Verified KITCOEK Student
                  </span>
                ) : (
                  <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
                    ⏳ Pending Verification
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                🎓 {user?.course} • {user?.studyYear} ({user?.collegeName || 'KITCOEK'})
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.1rem' }}>
                📍 {user?.approximateLocation} (Rule 6 Location Privacy Protected)
              </p>
            </div>

            {isOwnProfile && (
              <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                ✏️ Edit Profile
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{stats?.totalListings || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Active Listings</span>
            </div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>⭐ {stats?.averageRating || 'N/A'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                ({stats?.totalReviews || 0} Reviews)
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isVerifiedStudent ? 'var(--success)' : 'var(--warning)' }}>
                {isVerifiedStudent ? 'APPROVED' : 'PENDING'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                ID Verification
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
          Active Product Listings
        </h3>
        {activeListings?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active listings currently.</p>
        ) : (
          <div className="grid-products">
            {activeListings?.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
          Student Feedback & Reviews
        </h3>
        {reviews?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviews?.map((r) => (
              <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{r.reviewerId?.name}</strong>
                  <span>{'⭐'.repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
