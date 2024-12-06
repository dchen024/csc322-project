"use client"
import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from 'next/navigation';

const supabase = createClient();

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setImages(prev => [...prev, ...droppedFiles]);
    
    droppedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const sanitizeFileName = (fileName: string) => {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-') 
      .replace(/--+/g, '-')      
      .replace(/^-+|-+$/g, '');    
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      console.log(user.user_metadata.username);
      setUser(user);
    }
    getUserInfo();
    },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const imageUrls: string[] = [];

      for (const image of images) {
        const sanitizedName = sanitizeFileName(image.name);
        const fileName = `${Date.now()}-${sanitizedName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pictures')
          .upload(fileName, image);
      
        if (uploadError) throw uploadError;
      
        const { data: { publicUrl } } = supabase.storage
          .from('pictures')
          .getPublicUrl(fileName);
      
        imageUrls.push(publicUrl);
      }

      const { data, error } = await supabase
      .from('post')
      .insert([
        {
          title,
          description,
          starting_bid: Math.round(parseFloat(startingBid) * 100),
          current_bid: Math.round(parseFloat(startingBid) * 100),
          expire: new Date(expireDate).toISOString(),
          pictures: JSON.stringify(imageUrls),
          poster_name: user.user_metadata.username,
          poster_id: user.id,
        }
      ])
      .select();

      if (error) throw error;
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartingBid('');
      setExpireDate('');
      setImages([]);
      setPreviews([]);
      redirect('/home');
      
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 gap-8 mt-16">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startingBid">Starting Bid</Label>
          <Input
            id="startingBid"
            type="number"
            min="0"
            step="0.01"
            value={startingBid}
            onChange={(e) => setStartingBid(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expireDate">Expiration Date</Label>
          <Input
            id="expireDate"
            type="datetime-local"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit">Create Post</Button>
      </form>

      <div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
        >
          <p className="text-gray-500">Drag and drop images here</p>
          <p className="text-sm text-gray-400 mt-2">Supported formats: JPG, PNG</p>
          
          <input
            type="file"
            id="fileInput"
            multiple
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages(prev => [...prev, ...files]);
              
              files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setPreviews(prev => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
              });
            }}
          />
          
          <Button 
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            Choose Files
          </Button>
        </div>
        
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;