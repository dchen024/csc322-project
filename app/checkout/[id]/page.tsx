"use client"

import React, { use, useEffect, useState } from 'react';
import { 
  CreditCard, 
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();

// Add interfaces
interface Post {
  id: string;
  title: string;
  pictures: string;
  current_bid: number;
  status: string;
}

interface OrderDetails {
  name: string;
  image: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CheckoutPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: '',
    image: '',
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
    const router = useRouter();

  // Add form state management
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });

  // Add proper error handling
  const fetchPost = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError('Please login to checkout');
        router.push('/login');
        return;
      }

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

      // Calculate order details
      const pictures = JSON.parse(data.pictures);
      const subtotal = data.current_bid / 100;
      const shipping = +(subtotal * 0.1).toFixed(2);
      const tax = +(subtotal * 0.08).toFixed(2);
      const total = +(subtotal + shipping + tax).toFixed(2);

      setPost(data);
      setOrderDetails({
        name: data.title,
        image: pictures[0] || '/placeholder.jpg',
        subtotal,
        shipping,
        tax, 
        total
      });
    } catch (err) {
      setError('Error loading checkout details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch post data
  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found</div>;

  const handleQuickPayment = (method: string) => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Processing ${method} payment`);
    }, 2000);
  };

  // Improve form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.cardNumber) {
      setError('Please fill all required fields');
      setIsLoading(false);
      return;
    }

    // Simulate order processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/order/success');
    } catch {
      setError('Order processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mt-16 mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Payment Options */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Checkout</h1>

          {/* Product Preview Image */}
          <div className="md:hidden mb-6">
            <img
              src={orderDetails.image}
              alt={orderDetails.name}
              className="w-full rounded-lg object-cover"
            />
          </div>
          
          {/* Quick Payment Options */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Payment</h2>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="h-16 relative"
                onClick={() => handleQuickPayment('paypal')}
                disabled={isLoading}
              >
                <img 
                  src="https://play-lh.googleusercontent.com/xOKbvDt362x1uzW-nnggP-PgO9HM4L1vwBl5HgHFHy_n1X3mqeBtOSoIyNJzTS3rrj70" 
                  alt="PayPal" 
                  className="absolute left-4 h-10 w-10"
                /> Paypal
                <ChevronDown className="absolute right-4 w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 relative"
                onClick={() => handleQuickPayment('apple')}
                disabled={isLoading}
              >
                <img 
                  src="https://static-00.iconduck.com/assets.00/apple-pay-icon-2048x1594-cl3st1bm.png" 
                  alt="Apple Pay" 
                  className="absolute left-4 w-12 h-10"
                /> Apple Pay
                <ChevronDown className="absolute right-4 w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 relative"
                onClick={() => handleQuickPayment('google')}
                disabled={isLoading}
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" 
                  alt="Google Pay" 
                  className="absolute left-4 w-10 h-10"
                /> Google Pay
                <ChevronDown className="absolute right-4 w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or pay with card</span>
            </div>
          </div>

          {/* Traditional Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ca">California</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" required />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Information</h2>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expMonth">Expiry Month</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expYear">Expiry Year</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {String(new Date().getFullYear() + i).slice(-2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" maxLength={4} required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  Processing... <Check className="w-4 h-4 animate-spin" />
                </span>
              ) : (
                `Pay $${orderDetails.total.toFixed(2)}`
              )}
            </Button>
          </form>
        </div>

        {/* Right Column - Product Image and Order Summary */}
        <div className="space-y-6">
          {/* Product Preview Image - Desktop Only */}
          <div className="hidden md:block">
            <img
              src={orderDetails.image}
              alt={orderDetails.name}
              className="w-full rounded-lg object-cover mb-6"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${orderDetails.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="security">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Secure Checkout
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">
                    Your payment information is encrypted and secure. We never store your credit card details.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;