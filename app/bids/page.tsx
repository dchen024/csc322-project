"use client"

import React, { useState } from 'react';
import { 
  Clock,
  History,
  Trophy,
  AlertCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Types
interface BidHistory {
  amount: number;
  date: string;
  wasLeading: boolean;
}

interface BidItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  userHighestBid: number;
  startingPrice: number;
  endTime: string;
  timeLeft: string;
  status: 'active' | 'won' | 'outbid' | 'ended';
  totalBids: number;
  bidHistory: BidHistory[];
  isLeading: boolean;
  reservePrice: number;
}

const MyBidsPage = () => {
  // Sample data - replace with your actual data fetching logic
  const [bidItems, setBidItems] = useState<BidItem[]>([
    {
      id: "1",
      title: "Vintage Rolex Datejust",
      description: "1985 Rolex Datejust 36mm with jubilee bracelet",
      imageUrl: "https://www.assayjewelers.com/cdn/shop/files/Vintage-Rolex-Datejust-Ref_-1601-Two-Tone-Watch-With-Jubilee-Bracelet-Watches.jpg?v=1728437001",
      currentBid: 8500,
      userHighestBid: 8500,
      startingPrice: 5000,
      endTime: "2024-12-20T15:00:00Z",
      timeLeft: "2d 15h",
      status: 'active',
      totalBids: 12,
      isLeading: true,
      reservePrice: 7500,
      bidHistory: [
        { amount: 8500, date: "2024-11-10T14:00:00Z", wasLeading: true },
        { amount: 7800, date: "2024-11-09T10:00:00Z", wasLeading: true },
        { amount: 6500, date: "2024-11-08T09:00:00Z", wasLeading: false }
      ]
    },
    {
      id: "2",
      title: "Omega Speedmaster Professional",
      description: "Moonwatch with box and papers",
      imageUrl: "https://www.omegawatches.com/media/catalog/product/o/m/omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001001-3ccf4a.png?w=2000",
      currentBid: 6800,
      userHighestBid: 6500,
      startingPrice: 4000,
      endTime: "2024-12-18T10:00:00Z",
      timeLeft: "15h",
      status: 'outbid',
      totalBids: 18,
      isLeading: false,
      reservePrice: 5500,
      bidHistory: [
        { amount: 6500, date: "2024-11-10T12:00:00Z", wasLeading: false },
        { amount: 6000, date: "2024-11-09T15:00:00Z", wasLeading: true }
      ]
    },
    {
      id: "3",
      title: "Patek Philippe Calatrava",
      description: "Ref. 5196R-001 Rose Gold",
      imageUrl: "https://luxurytimenyc.com/cdn/shop/products/patek-philippe-37mm-calatrava-watch-white-dial-5196j-227472_350x.jpg?v=1593415027",
      currentBid: 25000,
      userHighestBid: 25000,
      startingPrice: 20000,
      endTime: "2024-11-10T18:00:00Z",
      timeLeft: "Ended",
      status: 'won',
      totalBids: 8,
      isLeading: true,
      reservePrice: 22000,
      bidHistory: [
        { amount: 25000, date: "2024-11-10T17:55:00Z", wasLeading: true },
        { amount: 23000, date: "2024-11-10T15:00:00Z", wasLeading: true }
      ]
    }
  ]);

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("timeLeft");

  const getStatusBadge = (status: BidItem['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'won':
        return <Badge className="bg-green-500">Won</Badge>;
      case 'outbid':
        return <Badge className="bg-red-500">Outbid</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500">Ended</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAndSortedItems = bidItems
    .filter(item => {
      if (filter === 'all') return true;
      return item.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.currentBid - b.currentBid;
        case 'priceDesc':
          return b.currentBid - a.currentBid;
        case 'timeLeft':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">My Bids</h1>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bids</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="outbid">Outbid</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeLeft">Time Left</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No bids found</AlertTitle>
          <AlertDescription>
            You haven't placed any bids yet. Start bidding to see your bid history here.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{item.title}</h2>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      {item.isLeading && (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          <Trophy className="w-3 h-3 mr-1" />
                          Leading Bid
                        </Badge>
                      )}
                    </div>
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
                      <div className="text-sm text-gray-500">Your Highest Bid</div>
                      <div className="font-semibold flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {item.userHighestBid.toLocaleString()}
                        {item.isLeading ? (
                          <ArrowUp className="h-4 w-4 text-green-500 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Total Bids</div>
                      <div className="font-semibold">{item.totalBids}</div>
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
                    <div className="text-sm text-gray-500 mb-1">Price Progress</div>
                    <Progress 
                      value={((item.currentBid - item.startingPrice) / (item.reservePrice - item.startingPrice)) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Start: ${item.startingPrice.toLocaleString()}</span>
                      <span>Reserve: ${item.reservePrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <Collapsible className="mt-4">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-500">
                      <History className="h-4 w-4" />
                      Bid History
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2">
                        {item.bidHistory.map((bid, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              {bid.amount.toLocaleString()}
                              {bid.wasLeading && (
                                <Badge variant="outline" className="text-xs">Leading</Badge>
                              )}
                            </div>
                            <div className="text-gray-500">
                              {formatDate(bid.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {item.status === 'active' && (
                    <div className="mt-4">
                      <Button className="w-full md:w-auto">
                        Place New Bid
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;