import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { formatApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusAlert from '../../components/common/StatusAlert';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    course: 'B.Tech Computer Science',
    studyYear: 'First Year',
    approximateLocation: 'Near KITCOEK, Kolhapur',
    password: '',
    confirmPassword: '',
  });
  const [studentIdImage, setStudentIdImage] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStudentIdImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusInfo(null);

    if (formData.password !== formData.confirmPassword) {
      return setStatusInfo({
        status: 400,
        title: 'Password Mismatch',
        description: 'The passwords entered do not match. Please enter matching passwords.',
      });
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (studentIdImage) {
        data.append('studentIdImage', studentIdImage);
      }

      const res = await API.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/home');
      }
    } catch (err) {
      setStatusInfo(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto' }} className="card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800' }}>
          KITCOEK Student Registration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          KITCOEK Exclusive Student Marketplace Access
        </p>
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
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            className="form-input"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              maxLength={10}
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              required
              className="form-input"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">College (Hard-Enforced)</label>
            <input type="text" disabled value="KITCOEK" className="form-input" style={{ backgroundColor: '#F0F0F0' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Course *</label>
            <input
              type="text"
              name="course"
              required
              className="form-input"
              value={formData.course}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year of Study *</label>
            <select name="studyYear" className="form-select" value={formData.studyYear} onChange={handleChange}>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Final Year">Final Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Approximate Location (Rule 6: Privacy Protection)</label>
          <input
            type="text"
            name="approximateLocation"
            required
            className="form-input"
            placeholder="e.g. Near KITCOEK Hostel / Kolhapur"
            value={formData.approximateLocation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <label className="form-label">Upload Student ID Card Photo (Option B Verification) *</label>
          <input type="file" accept="image/*" required onChange={handleFileChange} style={{ fontSize: '0.85rem' }} />
          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
            Admin will verify your KITCOEK Student ID before full marketplace approval.
          </small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
          {loading ? 'Creating Account...' : 'Register for RentMate'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Already registered?{' '}
        <Link to="/login" style={{ fontWeight: '700' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
