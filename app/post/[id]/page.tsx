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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';

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
  status: 'active' | 'ending-soon' | 'ended';
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
  const params = useParams();
  const postId = params.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  console.log(postId);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) throw error;
        if (isMounted) {
          setPost(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    return () => { isMounted = false };
  }, [postId]);

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

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bidInCents = Math.round(parseFloat(bidAmount) * 100);
      
      const { error } = await supabase
        .from('post')
        .update({ current_bid: bidInCents })
        .eq('id', post?.id);

      if (error) throw error;

      // Refresh post data
      const { data } = await supabase
        .from('post')
        .select('*')
        .eq('id', postId)
        .single();

      if (data) setPost(data);
      setIsBidding(false);
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
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
              <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{post.poster_name}</span>
              </div>
            </div>
            <Button
              variant={isWatchlisted ? "secondary" : "outline"}
              size="icon"
              onClick={() => toggleWatchlist(postId, post.poster_id)}
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
                    <Label htmlFor="bid">Your Bid Amount ($)</Label>
                    <Input
                      id="bid"
                      type="number"
                      step="0.01"
                      min={(post.current_bid / 100) + 0.01}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min bid: $${((post.current_bid / 100) + 0.01).toFixed(2)}`}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBidding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Confirm Bid
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ListingPage;