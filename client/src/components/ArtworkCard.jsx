import { Link } from 'react-router-dom';

export default function ArtworkCard({ artwork }) {
  return (
    <Link to={`/artwork/${artwork.ArtworkId}`} className="artwork-card">
      <div className="artwork-card-image">
        <img src={artwork.PreviewImageUrl} alt={artwork.Title} loading="lazy" />
      </div>
      <div className="artwork-card-body">
        {artwork.Category && (
          <div className="artwork-card-category">{artwork.Category}</div>
        )}
        <h3 className="artwork-card-title">{artwork.Title}</h3>
        <div className="artwork-card-footer">
          <span className="artwork-price">${Number(artwork.Price).toFixed(2)}</span>
          <span className="btn btn-secondary btn-sm">View</span>
        </div>
      </div>
    </Link>
  );
}
