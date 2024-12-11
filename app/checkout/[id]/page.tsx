"use client"
import React, { useEffect, useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface Post {
  id: string;
  title: string;
  pictures: string;
  current_bid: number;
  status: string;
  poster_id: string;
}

interface OrderDetails {
  name: string;
  image: string;
  total: number;
}

const CheckoutPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: '',
    image: '',
    total: 0
  });
  const router = useRouter();

  // Update fetchPost function
  const fetchPost = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError('Please login to checkout');
        router.push('/login');
        return;
      }

      // Get user balance
      const { data: userData, error: balanceError } = await supabase
        .from('Users')
        .select('balance')
        .eq('id', user?.id)
        .single();

      if (balanceError) throw balanceError;
      setUserBalance(userData.balance);

      // Get post details
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');

      // Verify user is highest bidder
      if (data.highest_bidder !== user?.id) {
        router.push('/home');
        return;
      }

      // Check if post is already completed
      if (data.status === 'completed') {
        router.push('/home');
        return;
      }

      const pictures = JSON.parse(data.pictures);
      setPost(data);
      setOrderDetails({
        name: data.title,
        image: pictures[0] || '/placeholder.jpg',
        total: data.current_bid
      });
    } catch (err) {
      setError('Error loading checkout details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      if (userBalance < orderDetails.total) {
        setError('Insufficient balance');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('Users')
        .update({ 
          balance: userBalance - orderDetails.total 
        })
        .eq('id', user?.id);

      if (balanceError) throw balanceError;

      // Redirect to rating page
      router.push(`/rating/${post?.poster_id}`);
    } catch (err) {
      setError('Failed to process purchase');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-2xl mt-16 mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Purchase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={orderDetails.image}
              alt={orderDetails.name}
              className="w-32 h-32 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold">{orderDetails.name}</h2>
              <div className="mt-2 text-sm text-gray-500">Purchase Amount</div>
              <div className="text-2xl font-bold">
                ${(orderDetails.total / 100).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-2xl font-bold">
              ${(userBalance / 100).toFixed(2)}
            </div>
          </div>

          {userBalance < orderDetails.total && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Balance</AlertTitle>
              <AlertDescription>
                Please reload your balance to complete this purchase.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full" 
            onClick={handlePurchase}
            disabled={isLoading || userBalance < orderDetails.total}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                Processing... <Check className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              'Confirm Purchase'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;