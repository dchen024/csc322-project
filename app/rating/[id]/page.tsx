// app/rating/[sellerId]/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const StarIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const StarFilledIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const RatingPage = () => {
  const { sellerId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState({ 
    username: '', 
    profile_picture: '' 
  });
  const router = useRouter();

  useEffect(() => {
    const fetchSeller = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('username, profile_picture')
        .eq('id', sellerId)
        .single();

      console.log(data);
      if (!error && data) {
        setSellerInfo({
          username: data.username,
          profile_picture: data.profile_picture || '/default-avatar.png'
        });
      }
    };

    fetchSeller();
  }, [sellerId]);

  const updateSellerRating = async () => {
    try {
      // Get all reviews for seller
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rate')
        .eq('reviewee', sellerId);

      if (reviewsError) throw reviewsError;

      // Calculate average
      const totalRating = reviews?.reduce((acc, review) => acc + (review.rate || 0), 0) || 0;
      const averageRating = reviews?.length ? totalRating / reviews.length : 5;

      // Update seller rating
      const { error: updateError } = await supabase
        .from('Users')
        .update({ rating: averageRating })
        .eq('id', sellerId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating seller rating:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Submit review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          reviewer: user?.id,
          reviewee: sellerId,
          comments: comment,
          rate: rating
        });

      if (reviewError) throw reviewError;

      // Update seller rating
      await updateSellerRating();

      router.push('/order/success');
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mt-16 mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            How would you rate your shopping experience with {sellerInfo.username}?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <img
                src={sellerInfo.profile_picture}
                alt={`${sellerInfo.username}'s profile`}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="text-lg font-medium">{sellerInfo.username}</span>
            </div>
            <div className="text-sm text-gray-500">
              How would you rate your experience?
            </div>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none transition-colors duration-200 hover:scale-110"
                >
                  {star <= rating ? (
                    <StarFilledIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!rating || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingPage;