import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import { getImageUrl } from '../../utils/formatters';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerifyStudent = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/verify-id`);
      alert('Student ID verified and account activated!');
      setPreviewModalImg(null);
      fetchUsers();
    } catch (err) {
      alert('Error verifying student');
    }
  };

  const handleBlockToggle = async (id, currentStatus) => {
    const endpoint = currentStatus === 'BLOCKED' ? 'unblock' : 'block';
    try {
      await API.patch(`/admin/users/${id}/${endpoint}`);
      fetchUsers();
    } catch (err) {
      alert(`Error updating user status`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management & Student ID Verification</h1>
          <p className="page-subtitle">Option B Verification & Account Moderation</p>
        </div>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div style={{ overflowX: 'auto' }} className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem' }}>Student</th>
                <th style={{ padding: '0.75rem' }}>Course / Year</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Student ID Photo</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.email} • {u.phone}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.course} ({u.studyYear})
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <Badge type={u.status} text={u.status} />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.studentIdImage?.url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg({ user: u, url: getImageUrl(u.studentIdImage.url) })}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--info)', fontWeight: '600' }}
                      >
                        🖼️ View ID Card
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>No Upload</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {u.status === 'PENDING' && (
                        <button onClick={() => handleVerifyStudent(u._id)} className="btn btn-primary btn-sm">
                          Verify ID
                        </button>
                      )}
                      <button
                        onClick={() => handleBlockToggle(u._id, u.status)}
                        className={`btn ${u.status === 'BLOCKED' ? 'btn-secondary' : 'btn-danger'} btn-sm`}
                      >
                        {u.status === 'BLOCKED' ? 'Unblock' : 'Block User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student ID Card Modal Preview */}
      {previewModalImg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '520px', width: '90%', padding: '1.5rem', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                🎓 {previewModalImg.user.name}'s Student ID Card
              </h3>
              <button
                onClick={() => setPreviewModalImg(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', backgroundColor: '#F0F0F0', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '0.5rem' }}>
              <img
                src={previewModalImg.url}
                alt="Student ID Card"
                style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {previewModalImg.user.course} ({previewModalImg.user.studyYear})
              </span>
              {previewModalImg.user.status === 'PENDING' && (
                <button
                  onClick={() => handleVerifyStudent(previewModalImg.user._id)}
                  className="btn btn-primary btn-sm"
                >
                  ✅ Approve & Verify Student ID
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
