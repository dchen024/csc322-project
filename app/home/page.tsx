'use client'

import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Award, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  poster_name: string;
  poster_id: string;
  starting_bid: number;
  current_bid: number;
  highest_bidder: string | null;
  expire: string;
  pictures: string;
  description: string;
  status: 'active' | 'ending-soon' | 'ended';
}

const supabase = createClient();

const HomePage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const getStatusVariant = (status: Post['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'ending-soon':
        return 'secondary';
      case 'ended':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 p-6">
      {posts.map((post) => (
        <Card 
          key={post.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          <CardHeader>
            <img 
              src={JSON.parse(post.pictures)[0] || '/placeholder.jpg'}
              alt={post.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </CardHeader>
          <CardContent>
            <CardTitle className="mb-2">{post.title}</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.poster_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Current Bid: ${(post.current_bid / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(post.expire).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge 
              variant={getStatusVariant(post.status)}
              className={`
                ${post.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                ${post.status === 'ending-soon' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                ${post.status === 'ended' ? 'bg-red-500 hover:bg-red-600' : ''}
              `}
            >
              {post.status}
            </Badge>
            <Button variant="outline">Place Bid</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default HomePage;