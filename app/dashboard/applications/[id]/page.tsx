"use client"
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const supabase = createClient();

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userFormData, setUserFormData] = useState({
    type: '',
    bad_review: 0,
    suspended: false,
    warning: false,
    suspended_times: 0
  });

  useEffect(() => {
    fetchApplicationData();
  }, []);

  async function fetchApplicationData() {
    const { data, error } = await supabase
      .from('application')
      .select(`
        *,
        user:Users(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch application data",
      });
      return;
    }

    setApplication(data);
    setLoading(false);
  }

  async function handleUserUpdate(updates: any) {
    setSubmitting(true);

    const { error } = await supabase
      .from('Users')
      .update(updates)
      .eq('id', application.user_id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    } else {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      fetchApplicationData();
    }

    setSubmitting(false);
  }

  async function handleApplicationUpdate(approve: boolean) {
    if (approve && application.user.type === 'user') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User already has user privileges",
      });
      return;
    }

    setSubmitting(true);

    // Update application status
    const { error: applicationError } = await supabase
      .from('application')
      .update({
        status: 'resolved'
      })
      .eq('id', params.id);

    if (applicationError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status",
      });
      setSubmitting(false);
      return;
    }

    // Update user type if approved
    if (approve) {
      const { error: userError } = await supabase
        .from('Users')
        .update({
          type: 'user'
        })
        .eq('id', application.user_id);

      if (userError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update user type",
        });
        setSubmitting(false);
        return;
      }
    }

    toast({
      title: "Success",
      description: `Application ${approve ? 'approved' : 'declined'} successfully`,
    });
    
    router.push('/dashboard');
    setSubmitting(false);
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Application Details</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Status</p>
              <div className={`px-2 py-1 rounded-full text-xs font-medium text-white inline-block
                ${application.status === 'initiated' ? 'bg-red-500' : 
                  application.status === 'under-review' ? 'bg-yellow-500' : 
                  application.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'}`}>
                {application.status}
              </div>
            </div>
            <div>
              <p className="font-medium">Created At</p>
              <p>{new Date(application.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Username</p>
              <p>{application.username}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>{application.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p>{application.user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{application.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Rating</p>
              <p>{application.user.rating.toFixed(1)} / 5.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p>{(application.user.balance / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p className="capitalize">{application.user.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bad Reviews</p>
              <p>{application.user.bad_review}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Suspensions</p>
              <p>{application.user.suspended_times}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {application.user.suspended && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                Suspended
              </span>
            )}
            {application.user.warning && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                Warning
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit User</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUserUpdate(userFormData);
                }}>
                  <DialogHeader>
                    <DialogTitle>Edit User Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select
                        defaultValue={application.user.type}
                        onValueChange={(value) => setUserFormData(prev => ({...prev, type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor">Visitor</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Bad Reviews</Label>
                      <Input 
                        type="number"
                        min="0"
                        defaultValue={application.user.bad_review}
                        onChange={(e) => setUserFormData(prev => ({
                          ...prev, 
                          bad_review: parseInt(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Suspended</Label>
                      <Switch
                        checked={userFormData.suspended}
                        onCheckedChange={(checked) => setUserFormData(prev => ({
                          ...prev,
                          suspended: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Warning</Label>
                      <Switch
                        checked={userFormData.warning}
                        onCheckedChange={(checked) => setUserFormData(prev => ({
                          ...prev,
                          warning: checked
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Suspension Times</Label>
                      <Input 
                        type="number"
                        min="0"
                        defaultValue={application.user.suspended_times}
                        onChange={(e) => setUserFormData(prev => ({
                          ...prev,
                          suspended_times: parseInt(e.target.value)
                        }))}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {application.status !== 'resolved' && (
        <div className="flex justify-end gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={submitting}>
                Decline
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will decline the user application. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleApplicationUpdate(false)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" disabled={submitting}>
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will approve the user application and grant them user privileges.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleApplicationUpdate(true)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}