import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatPrice, getImageUrl } from '../../utils/formatters';

const ProductCard = ({ product }) => {
  const mainImage =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[0].url)
      : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '65%',
          backgroundColor: '#F5F5F5',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '0.85rem',
        }}
      >
        <img
          src={mainImage}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=RentMate+Product';
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
          <Badge type={product.transactionType} />
          {product.availability !== 'AVAILABLE' && (
            <Badge type={product.availability} text={product.availability} />
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: '700',
            marginBottom: '0.35rem',
            color: 'var(--text-main)',
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </h3>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
          }}
        >
          Condition: <strong>{product.condition?.replace('_', ' ')}</strong>
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.35rem',
            marginBottom: '0.85rem',
          }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: 'var(--text-main)',
            }}
          >
            {formatPrice(product.price)}
          </span>
          {product.transactionType === 'RENT' && product.rentalPeriod && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              /{product.rentalPeriod}
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            📍 {product.approximateLocation || 'Near KITCOEK'}
          </span>

          <Link to={`/products/${product._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
