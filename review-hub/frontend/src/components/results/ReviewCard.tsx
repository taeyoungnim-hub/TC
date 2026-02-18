'use client';

import { ExternalLink, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ReviewItem } from '@/types';
import { formatRelativeDate, getDomainFavicon, SOURCE_TYPE_LABELS, SENTIMENT_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: ReviewItem;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const sentimentInfo = review.sentiment ? SENTIMENT_LABELS[review.sentiment] : null;

  return (
    <a
      href={review.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="card block hover:shadow-md hover:border-primary-200 transition-all group animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Source favicon */}
          <img
            src={getDomainFavicon(review.domain)}
            alt={review.domain}
            className="w-5 h-5 rounded flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {SOURCE_TYPE_LABELS[review.sourceType]}
              </span>
              <span className="text-xs text-gray-400">{review.domain}</span>
              {sentimentInfo && (
                <span className={cn('badge text-xs', sentimentInfo.color)}>
                  {sentimentInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {review.rating !== undefined && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {review.rating.toFixed(1)}
              </span>
            </div>
          )}
          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-700 transition-colors">
          {review.title}
        </h3>
      )}

      {/* Snippet */}
      {review.snippet && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
          {review.snippet}
        </p>
      )}

      {/* Pros / Cons inline */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="flex gap-4 mb-3">
          {review.pros.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-green-700 line-clamp-1">{review.pros[0]}</span>
            </div>
          )}
          {review.cons.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsDown className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-red-600 line-clamp-1">{review.cons[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Keywords */}
      {review.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.keywords.slice(0, 5).map((kw) => (
            <span key={kw} className="badge bg-blue-50 text-blue-600">#{kw}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-3">
          {review.authorName && (
            <span className="text-xs text-gray-400">{review.authorName}</span>
          )}
          {review.publishedAt && (
            <span className="text-xs text-gray-400">{formatRelativeDate(review.publishedAt)}</span>
          )}
        </div>
        <span className="text-xs text-primary-500 font-medium group-hover:underline">
          원문 보기
        </span>
      </div>
    </a>
  );
}
