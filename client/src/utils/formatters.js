export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x200?text=RentMate+Item';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://via.placeholder.com/300x200?text=RentMate+Item';
};
