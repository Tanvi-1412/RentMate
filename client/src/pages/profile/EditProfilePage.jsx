import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EditProfilePage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    course: currentUser?.course || '',
    studyYear: currentUser?.studyYear || 'First Year',
    approximateLocation: currentUser?.approximateLocation || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch('/users/me', formData);
      if (res.data.success) {
        setCurrentUser(res.data.data);
        alert('Profile updated!');
        navigate('/profile');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }} className="card">
      <h2>Edit Profile Info</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Course</label>
          <input
            type="text"
            className="form-input"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Approximate Location (Rule 6)</label>
          <input
            type="text"
            className="form-input"
            value={formData.approximateLocation}
            onChange={(e) => setFormData({ ...formData, approximateLocation: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
