'use client';

import { ReviewItem } from '@/types';
import { ReviewCard } from './ReviewCard';
import { ResultsSkeleton } from './ResultsSkeleton';
import { SearchX } from 'lucide-react';

interface ReviewListProps {
  reviews: ReviewItem[];
  isProcessing?: boolean;
}

export function ReviewList({ reviews, isProcessing }: ReviewListProps) {
  if (reviews.length === 0) {
    if (isProcessing) {
      return (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            리뷰를 수집하고 있습니다...
          </div>
          <ResultsSkeleton count={3} />
        </div>
      );
    }

    return (
      <div className="card text-center py-16">
        <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">수집된 리뷰가 없습니다</p>
        <p className="text-sm text-gray-400 mt-1">다른 검색어를 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 font-medium">{reviews.length}개의 리뷰</p>
      {reviews.map((review) => (
        <ReviewCard key={review.urlHash} review={review} />
      ))}
      {isProcessing && (
        <div className="flex items-center gap-2 pt-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          더 많은 리뷰를 분석 중...
        </div>
      )}
    </div>
  );
}
