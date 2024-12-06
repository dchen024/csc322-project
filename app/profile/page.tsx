"use client"

import React, { useState, useEffect } from 'react';
import { Edit, X, Camera } from 'lucide-react';
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
import { User } from '@supabase/supabase-js';

interface Post {
  id: string;
  title: string;
  starting_bid: number;
  expire: string;
  pictures: string;
  created_at: string;
}

const ProfilePage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userData });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('username, email')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        if (userData) {
          setUserData({
            username: userData.username || '',
            email: userData.email || '',
          });
          setEditForm({
            username: userData.username || '',
            email: userData.email || '',
          });
        }

        // Get user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('post')
          .select('*')
          .eq('poster_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('Users')
        .update({
          username: editForm.username,
          email: editForm.email,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserData(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 py-8">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm hover:bg-gray-50">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.username}
                </h1>
                <p className="text-gray-600">{userData.email}</p>
              </div>

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
                    <p>Starting bid: ${post.starting_bid}</p>
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