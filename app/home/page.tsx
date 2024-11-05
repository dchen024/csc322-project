import React from 'react';
import { Clock, DollarSign, Award, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Types for our data
type Listing = {
  id: string;
  itemName: string;
  seller: {
    name: string;
    rating: number;
  };
  currentBid: number;
  startingBid: number;
  endTime: string;
  imageUrl: string;
  bids: number;
  status: 'active' | 'ending-soon' | 'ended';
};

const sampleListings: Listing[] = [
  {
    id: '1',
    itemName: 'Vintage Camera',
    seller: { name: 'PhotoEnthusiast', rating: 4.8 },
    currentBid: 250,
    startingBid: 100,
    endTime: '2024-11-15T15:00:00',
    imageUrl: 'https://i0.wp.com/alysvintagecameraalley.com/wp-content/uploads/2021/11/RolleiOriginal_4.jpg?fit=982%2C655&ssl=1',
    bids: 12,
    status: 'active'
  },
  {
    id: '2',
    itemName: 'Gaming Console',
    seller: { name: 'TechDeals', rating: 4.9 },
    currentBid: 450,
    startingBid: 300,
    endTime: '2024-11-13T10:00:00',
    imageUrl: 'https://m.media-amazon.com/images/I/61i421VnFYL.jpg',
    bids: 8,
    status: 'ending-soon'
  },
  {
    id: '3',
    itemName: 'Antique Watch',
    seller: { name: 'LuxuryFinds', rating: 5.0 },
    currentBid: 1200,
    startingBid: 800,
    endTime: '2024-11-12T20:00:00',
    imageUrl: 'https://precisionwatches.com/wp-content/uploads/2021/11/Rolex-Submariner-Vintage-5513-Ghost.jpg',
    bids: 15,
    status: 'ended'
  }
];

const HomePage = () => {
  const getStatusColor = (status: Listing['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'ending-soon':
        return 'bg-yellow-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Current Auctions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <img
                  src={listing.imageUrl}
                  alt={listing.itemName}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{listing.itemName}</CardTitle>
                  <Badge className={`${getStatusColor(listing.status)} text-white`}>
                    {listing.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <User size={16} />
                  <span>{listing.seller.name}</span>
                  <span className="flex items-center">
                    <Award size={16} className="text-yellow-500" />
                    {listing.seller.rating}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <DollarSign size={16} />
                      Current Bid
                    </span>
                    <span className="font-bold">${listing.currentBid}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      Time Left
                    </span>
                    <span>{formatTimeLeft(listing.endTime)}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {listing.bids} bids · Starting bid: ${listing.startingBid}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full"
                  disabled={listing.status === 'ended'}
                >
                  Place Bid
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;