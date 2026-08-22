interface Props {
  rating?: number;
  reviewCount?: number;
}

export function ProductRating({ rating = 4.8, reviewCount = 32 }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  return (
    <div className="flex items-center gap-2">
      <div className="flex text-gold-500">
        {stars.map((filled, idx) => (
          <svg
            key={idx}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <span className="text-xs text-ink/50">
        {rating.toFixed(1)} ({reviewCount} avaliações)
      </span>
    </div>
  );
}
