"use client"

import React, { useState } from 'react';
import { 
  Clock,
  Heart,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Types for our items
interface WatchlistItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  userBid: number | null;
  endTime: string;
  bids: number;
  isLeading: boolean;
  timeLeft: string;
}

const WatchlistPage = () => {
  // Sample data - replace with your actual data fetching logic
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([
    {
      id: "1",
      title: "Vintage Rolex Submariner",
      description: "1960s Rolex Submariner in excellent condition",
      imageUrl: "https://precisionwatches.com/wp-content/uploads/2021/11/Rolex-Submariner-Vintage-5513-Ghost.jpg",
      currentBid: 15000,
      userBid: 14500,
      endTime: "2024-12-20T15:00:00Z",
      bids: 23,
      isLeading: false,
      timeLeft: "2d 15h"
    },
    {
      id: "2",
      title: "Patek Philippe Nautilus",
      description: "Brand new Patek Philippe Nautilus 5711",
      imageUrl: "https://luxurytimenyc.com/cdn/shop/files/patek-philippe-nautilus-platinum-40th-anniversary-57111p-001-876366_530x.webp?v=1715400120",
      currentBid: 85000,
      userBid: 85000,
      endTime: "2024-12-21T18:00:00Z",
      bids: 15,
      isLeading: true,
      timeLeft: "3d 18h"
    },
    // Add more items as needed
  ]);

  const [sortBy, setSortBy] = useState("endTime");

  const removeFromWatchlist = (itemId: string) => {
    setWatchlistItems(items => items.filter(item => item.id !== itemId));
  };

  const sortItems = (items: WatchlistItem[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "priceAsc":
          return a.currentBid - b.currentBid;
        case "priceDesc":
          return b.currentBid - a.currentBid;
        case "endTime":
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        default:
          return 0;
      }
    });
  };

  const sortedItems = sortItems(watchlistItems);

  if (watchlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Your Watchlist</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No items in your watchlist</AlertTitle>
          <AlertDescription>
            Start adding items to your watchlist to keep track of auctions you're interested in.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Watchlist</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="endTime">Time Left</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    <Heart className="h-5 w-5 fill-current text-red-500" />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Current Bid</div>
                    <div className="font-semibold flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {item.currentBid.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Your Bid</div>
                    <div className="font-semibold flex items-center">
                      {item.userBid ? (
                        <>
                          <DollarSign className="h-4 w-4" />
                          {item.userBid.toLocaleString()}
                          {item.isLeading ? (
                            <ArrowUp className="h-4 w-4 text-green-500 ml-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 ml-1" />
                          )}
                        </>
                      ) : (
                        "No bid"
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Total Bids</div>
                    <div className="font-semibold">{item.bids}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Time Left</div>
                    <div className="font-semibold flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.timeLeft}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="w-full md:w-auto">
                    Place Bid
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;