"use client"
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  StarHalf, 
  Heart,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ListingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  // Placeholder data
  const images = Array(5).fill(null);
  const listing = {
    title: "Vintage Camera",
    seller: "Camera Enthusiast",
    rating: 4.5,
    currentBid: 150,
    timeLeft: "2 days",
    description: "A beautiful vintage camera in excellent condition. Perfect for collectors or photography enthusiasts. Comes with original leather case and manual."
  };

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

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle bid submission
    setIsBidding(false);
    setBidAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] mb-8">
        <div className="absolute inset-0 bg-gray-200 rounded-lg overflow-hidden">
          {/* Placeholder for image */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Image {currentImageIndex + 1}
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Indicators */}
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

      {/* Listing Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{listing.seller}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">{listing.rating}</span>
                </div>
              </div>
            </div>
            <Button
              variant={isWatchlisted ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsWatchlisted(!isWatchlisted)}
            >
              <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-6">{listing.description}</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className="text-2xl font-bold">${listing.currentBid}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Time Left</p>
                <p className="text-lg font-semibold">{listing.timeLeft}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Dialog open={isBidding} onOpenChange={setIsBidding}>
            <DialogTrigger asChild>
              <Button className="w-full">Place Bid</Button>
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
                      min={listing.currentBid + 0.01}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min bid: $${(listing.currentBid + 0.01).toFixed(2)}`}
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