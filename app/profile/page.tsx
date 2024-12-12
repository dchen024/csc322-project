"use client"

import React, { useState, useEffect } from 'react';
import { Edit, X, Camera, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

// Add interfaces
interface Post {
  id: string;
  title: string;
  starting_bid: number;
  expire: string;
  pictures: string;
  created_at: string;
}

// Update RecentOrder interface
interface RecentOrder {
  id: string;
  created_at: string;
  buyer: string;
  seller: string;
  shipping_address: string;
  post: {
    title: string;
    pictures: string;
    current_bid: number;
  };
}

interface RecentBid {
  id: string;
  created_at: string;
  bid_amount: number;
  post: {
    title: string;
    pictures: string;
  };
}

// Update Issue interface
interface Issue {
  id: string;
  created_at: string;
  comments: string;
  response: Array<{
    username: string;
    message: string;
    timestamp: string;
  }> | null;
  issuer: {
    username: string;
  };
  status: string; // Add this line
}

const formatCurrency = (cents: number) => {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

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

const ProfilePage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    profile_picture: '',
    rating: 5, // Default rating
    type: '', // Add this line
    bad_reviews: 0, // Add this line
    warning: false, // Add this line
    suspended: false // Add this line
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userData });
  const [loading, setLoading] = useState(true);

  // Add state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [userIssues, setUserIssues] = useState<any[]>([]);
  const [newResponses, setNewResponses] = useState<{ [key: string]: string }>({});

  // Modify the main useEffect to include all data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Get user profile data and balance
        const { data: userData, error: profileError } = await supabase
          .from('Users')
          .select('*') // Add type, bad_reviews, and warning
          .eq('id', user.id)
          .single();

        console.log(userData)
        if (userError) throw userError;
        if (userData) {
          setUserData({
            username: userData.username || '',
            email: userData.email || '',
            profile_picture: userData.profile_picture || '',
            rating: userData.rating || 5,
            type: userData.type || '', // Add this line
            bad_reviews: userData.bad_reviews || 0, // Add this line
            warning: userData.warning || false, // Add this line
            suspended: userData.suspended || false // Add this line
          });
          setEditForm({
            username: userData.username || '',
            email: userData.email || '',
            profile_picture: userData.profile_picture || '',
            rating: userData.rating || 5,
            type: userData.type || '', // Add this line
            bad_reviews: userData.bad_reviews || 0, // Add this line
            warning: userData.warning || false, // Add this line
            suspended: userData.suspended || false // Add this line
          });
          setBalance(userData.balance || 0);
        }

        // Get user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('post')
          .select('*')
          .eq('poster_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // Get recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            buyer,
            seller,
            shipping_address,
            post!inner (
              id,
              title,
              pictures,
              current_bid
            )
          `)
          .eq('buyer', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        console.log('User ID:', user.id); // Debug user ID
        console.log('Orders Error:', ordersError); // Debug any errors
        console.log('Orders Data:', ordersData); // Debug returned data

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else if (!ordersData) {
          console.log('No orders found for user');
        } else {
          setRecentOrders(ordersData);
        }

        // Get recent bids
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            id,
            created_at,
            bid_amount,
            post (
              title,
              pictures
            )
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!bidsError && bidsData) {
          setRecentBids(bidsData);
        }

        // Get user's issues
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select(`
            id,
            created_at,
            comments,
            response,
            issuer:issuer ( username ),
            status
          `)
          .or(`issuer.eq.${user.id},issuee.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (issuesError) throw issuesError;

        console.log(issuesData);
        setUserIssues(issuesData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('pictures')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pictures')
        .getPublicUrl(fileName);

      setEditForm(prev => ({
        ...prev,
        profile_picture: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('Users')
        .update({
          username: editForm.username,
          email: editForm.email,
          profile_picture: editForm.profile_picture,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserData(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleResponseSubmit = async (issueId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newResponse = {
        username: userData.username,
        message: newResponses[issueId],
        timestamp: new Date().toISOString()
      };

      const issue = userIssues.find(i => i.id === issueId);
      const updatedResponses = issue?.response 
        ? [...issue.response, newResponse] 
        : [newResponse];

      const { error } = await supabase
        .from('issues')
        .update({ 
          response: updatedResponses 
        })
        .eq('id', issueId);

      if (error) throw error;

      // Clear input and refresh issues
      setNewResponses(prev => ({...prev, [issueId]: ''}));
    } catch (err) {
      console.error('Error submitting response:', err);
    }
  };

  // Add this function to handle status color coding
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated':
        return 'bg-red-500';
      case 'under-review':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAcknowledgeWarning = async () => {
    if (!user) return;
  
    try {
      const { error } = await supabase
        .from('Users')
        .update({ warning: false })
        .eq('id', user.id);
  
      if (error) throw error;
  
      setUserData(prev => ({ ...prev, warning: false }));
    } catch (error) {
      console.error('Error acknowledging warning:', error);
    }
  };

  const handlePayFine = async () => {
    router.push('/reactivate');
  };

  const handleContactSupport = () => {
    router.push('/support');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 py-8">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      {userData.warning && ( // Add this block
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700  p-4 mb-4">
                <p className="font-bold">Warning</p>
                <p>A user has given you a rating less than 2. You have {2 - userData.bad_reviews} bad review(s) left before your account is suspended.</p>
                <Button onClick={handleAcknowledgeWarning} className="mt-2">Acknowledge</Button>
              </div>
            )}
        {userData.suspended && ( // Add this block
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-bold">Account Suspended</p>
            <p>Your account has been suspended. You can pay a $50 fine to continue using the app, contact support, and if you do nothing within 1 month, your account will be disabled.</p>
            <Button onClick={handlePayFine} className="mt-2">Pay Fine</Button>
            <Button onClick={handleContactSupport} className="mt-2 ml-2">Contact Support</Button>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <img
                src={userData.profile_picture || '/default-avatar.png'}
                alt="Profile picture"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            </div>
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm hover:bg-gray-50"
                onClick={() => document.getElementById('profile-upload')?.click()}
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          {/* Rest of the user info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{userData.username}</h2>
              <RatingStars rating={userData.rating} />
              <span className="text-sm text-gray-500">({userData.type})</span> {/* Add this line */}
            </div>
            <p className="text-gray-600">{userData.email}</p>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Picture
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        {editForm.profile_picture ? (
                        <img
                          src={editForm.profile_picture}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />):(<Camera className="w-4 h-4" />)}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Add JSX after profile section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Balance Card */}
        {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Account Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="text-5xl font-bold text-center py-8">
            ${(balance / 100).toFixed(2)}
          </div>
          <div className="w-full space-y-3">
            <Button 
              className="w-full"
              onClick={() => router.push('/reload')}
            >
              Reload Balance
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push('/reload')}
            >
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>

        {/* Update Recent Orders Card JSX */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => {
                const address = JSON.parse(order.shipping_address);
                return (
                  <div key={order.id} className="flex items-center gap-4">
                    <img
                      src={JSON.parse(order.post.pictures)[0]}
                      alt={order.post.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium truncate">{order.post.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {address.city}, {address.state}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(order.post.current_bid / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/order')}
            >
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bids Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBids.map(bid => (
                <div key={bid.id} className="flex items-center gap-4">
                  <img
                    src={JSON.parse(bid.post.pictures)[0]}
                    alt={bid.post.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium truncate">{bid.post.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(bid.bid_amount / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/bids')}
            >
              View All Bids
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Issues Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Issues</h2>
        <div className="space-y-4">
          {userIssues.map((issue) => (
        <Card key={issue.id}>
          <CardHeader onClick={() => router.push(`/issues/${issue.id}`)} className="flex justify-between flex-row items-center">
            <div>
              <CardTitle className="text-base font-medium">
            Issue reported by {issue.issuer.username}
              </CardTitle>
              <p className="text-sm text-gray-500">
            {new Date(issue.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-white px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
              {issue.status}
            </span>
          </CardHeader>
          <CardContent>
            <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <span className="text-sm">View Details</span>
            <ChevronRight className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2 space-y-4">
            <p className="text-sm text-gray-600">{issue.comments}</p>
          </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
          ))}
          {userIssues.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No issues reported
        </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
            {posts.map((post) => {
              const pictures = JSON.parse(post.pictures || '[]');
              return (
                <div
                  key={post.id}
                  className="aspect-[4/3] bg-gray-200 rounded-[32px] hover:opacity-75 transition-opacity cursor-pointer relative"
                  onClick={() => handlePostClick(post.id)}
                >
                  {pictures[0] && (
                    <img
                      src={pictures[0]}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-[32px]"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white rounded-b-[32px]">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p>Starting bid: {formatCurrency(post.starting_bid)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;