"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  StarHalf, 
  Heart,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import { table } from 'console';

const supabase = createClient();

interface Post {
  id: string;
  title: string;
  description: string;
  poster_name: string;
  poster_id: string;
  starting_bid: number;
  current_bid: number;
  expire: string;
  pictures: string;
  status: 'active' | 'ending-soon' | 'ended' | 'completed';
  poster: {
    username: string;
    rating: number;
    profile_picture?: string;
  };
}

const calculateTimeRemaining = (expireDate: string) => {
  const now = new Date().getTime();
  const expirationTime = new Date(expireDate).getTime();
  const difference = expirationTime - now;

  if (difference <= 0) {
    return 'Expired';
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const ListingPage = () => {
  const { id } = useParams();
  const [userId, setUserId] = useState('');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [userBalance, setUserBalance] = useState(0);
  const [bidError, setBidError] = useState('');
  console.log(id);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && isMounted) {
        setUserId(user.id);
        // Get user balance
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (!userError && userData) {
          setUserBalance(userData.balance);
        }

        // Check watchlist status after setting user id
        const { data: watchlistItem } = await supabase
          .from('watchlist')
          .select()
          .eq('user_id', user.id)
          .eq('post_id', id)
          .maybeSingle();
        
        setIsWatchlisted(!!watchlistItem);
      }
    };

    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('post')
          .select(`
            *,
            poster:poster_id (
              username,
              rating,
              profile_picture
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Post not found');

        // Transform the data to match the Post interface
        const transformedPost = {
          ...data,
          poster: {
            username: data.poster?.username || 'Unknown',
            rating: data.poster?.rating || 5,
            profile_picture: data.poster?.profile_picture
          }
        };
        setPost(transformedPost);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setLoading(false);
      }
    };

    fetchPost();
    return () => { isMounted = false };
  }, [id]);

    useEffect(() => {
    if (!post?.expire) return;
  
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(post.expire));
    }, 1000);
  
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(post.expire));
  
    return () => clearInterval(timer);
  }, [post?.expire]);

  if (loading || !post) return <div>Loading...</div>;

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const images = JSON.parse(post.pictures) as string[];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const validateBidAmount = (amount: string): string | null => {
    const bidInCents = Math.round(parseFloat(amount) * 100);
    const minBidAmount = Math.max(post?.starting_bid || 0, (post?.current_bid || 0) + 1);
  
    if (isNaN(bidInCents)) {
      return 'Please enter a valid amount';
    }
    if (bidInCents <= (post?.current_bid || 0)) {
      return 'Bid must be higher than current bid';
    }
    if (bidInCents > userBalance) {
      return 'Insufficient balance';
    }
    return null;
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
    const error = validateBidAmount(value);
    setBidError(error || '');
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError('');
    
    const validationError = validateBidAmount(bidAmount);
    if (validationError) {
      setBidError(validationError);
      return;
    }
  
    try {
      const bidInCents = Math.round(parseFloat(bidAmount) * 100);
      
      // Update post
      const { error } = await supabase
        .from('post')
        .update({ 
          current_bid: bidInCents, 
          highest_bidder: userId 
        })
        .eq('id', post?.id);
  
      if (error) throw error;
  
      // Update user balance
      const { error: balanceError } = await supabase
        .from('Users')
        .update({ 
          balance: userBalance - bidInCents 
        })
        .eq('id', userId);
  
      if (balanceError) throw balanceError;
  
      // Record bid
      const { error: bidError } = await supabase.from('bids').insert({
        post_id: post?.id,
        bidder_id: userId,
        bid_amount: bidInCents
      });
  
      if (bidError) throw bidError;
      
      setPost({...post!, current_bid: bidInCents});
      setIsBidding(false);
      setBidAmount('');
      setUserBalance(userBalance - bidInCents); // Update local balance
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError('Error placing bid. Please try again.');
    }
  };

  // Function to toggle watchlist status
  const toggleWatchlist = async (postId: string, userId: string) => {
    try {
      // Check if item exists in watchlist
      const { data: existingItem } = await supabase
        .from('watchlist')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
  
      if (existingItem) {
        // Remove from watchlist
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
  
        if (error) throw error;
        
        // Update UI state (assuming you have some state management)
        setIsWatchlisted(false);
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('watchlist')
          .insert([
            {
              post_id: postId,
              user_id: userId
            }
          ]);
  
        if (error) throw error;
        
        // Update UI state
        setIsWatchlisted(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative aspect-[4/3] mb-8">
        <div className="absolute inset-0 bg-gray-200 rounded-lg overflow-hidden">
          {images[currentImageIndex] && (
            <img 
              src={images[currentImageIndex]}
              alt={`${post.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-4' : 'bg-white/60'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                {(post.status == 'ended' || post.status == 'completed') && (
                  <span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded">
                    Completed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={post.poster.profile_picture || ''} />
                  <AvatarFallback>{post.poster.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{post.poster.username}</span>
                <RatingStars rating={post.poster.rating} />
              </div>
            </div>
            <Button
              variant={isWatchlisted ? "secondary" : "outline"}
              size="icon"
              onClick={() => id && toggleWatchlist(id as string, post.poster_id)}
            >
              <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-6">{post.description}</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Starting Bid</p>
              <p className="text-xl font-semibold">${(post.starting_bid / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Bid</p>
              <p className="text-2xl font-bold">${(post.current_bid / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Left</p>
              <p className="text-lg font-semibold">{timeRemaining}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          {post.status === 'completed' ? (
            <Button className="w-full" disabled>
              Auction Ended
            </Button>
          ) : (
            <Dialog open={isBidding} onOpenChange={setIsBidding}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={post.status === 'ended'}>
                  Place Bid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Your Bid</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBidSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="bid">Your Bid Amount ($)</Label>
                        <span className="text-sm text-gray-500">
                          Balance: ${(userBalance / 100).toFixed(2)}
                        </span>
                      </div>
                      <Input
                        id="bid"
                        type="number"
                        step="0.01"
                        min={(post.current_bid / 100) + 0.01}
                        required
                        value={bidAmount}
                        onChange={handleBidChange}
                        placeholder={`Min bid: $${((post.current_bid / 100) + 0.01).toFixed(2)}`}
                      />
                      {bidError && (
                        <p className="text-sm text-red-500 mt-1">{bidError}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsBidding(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        !bidAmount || 
                        !!validateBidAmount(bidAmount) ||
                        post.status === 'ended'
                      }
                    >
                      Confirm Bid
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ListingPage;