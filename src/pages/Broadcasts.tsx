import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NewBroadcastForm } from "@/components/NewBroadcastForm";
import { 
  Send, 
  Plus, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  X,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { campaignApi } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";
import { format } from "date-fns";

export default function Broadcasts() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const socket = useSocket();

  useEffect(() => {
    loadCampaigns();
    setupSocketListeners();
    
    return () => {
      // Cleanup socket listeners
      socket.off('campaign-status-update');
      socket.off('campaign-progress-update');
      socket.off('campaign-completed');
    };
  }, []);

  const setupSocketListeners = () => {
    socket.onCampaignStatusUpdate((data) => {
      console.log('Campaign status update received:', data);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === data.campaignId 
          ? { ...campaign, status: data.status, progress: data.progress }
          : campaign
      ));
    });

    socket.onCampaignProgressUpdate((data) => {
      console.log('Campaign progress update received:', data);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === data.campaignId 
          ? { ...campaign, progress: data.progress }
          : campaign
      ));
    });

    socket.onCampaignCompleted((data) => {
      console.log('Campaign completed event received:', data);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === data.campaignId 
          ? { ...campaign, status: 'completed', progress: data.progress }
          : campaign
      ));
      
      toast({
        title: "Campaign Completed",
        description: `Campaign "${data.campaignName || 'Unknown'}" has finished sending to all recipients.`,
      });
    });
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewBroadcast = async (data: any) => {
    try {
      const response = await campaignApi.create(data);
      setCampaigns(prev => [response.data, ...prev]);
      setShowNewForm(false);
      
      // Join the campaign room for real-time updates
      socket.joinCampaign(response.data._id);
      
      toast({
        title: "Campaign Created",
        description: `Campaign "${data.name}" has been ${data.scheduledAt > new Date() ? "scheduled" : "started"}.`,
      });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create campaign",
        variant: "destructive"
      });
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      await campaignApi.cancel(campaignId);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === campaignId 
          ? { ...campaign, status: 'cancelled' }
          : campaign
      ));
      
      toast({
        title: "Campaign Cancelled",
        description: "Campaign has been cancelled successfully.",
      });
    } catch (error: any) {
      console.error('Error cancelling campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel campaign",
        variant: "destructive"
      });
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await campaignApi.pause(campaignId);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === campaignId 
          ? { ...campaign, status: 'paused' }
          : campaign
      ));
      
      toast({
        title: "Campaign Paused",
        description: "Campaign has been paused.",
      });
    } catch (error: any) {
      console.error('Error pausing campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to pause campaign",
        variant: "destructive"
      });
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await campaignApi.resume(campaignId);
      setCampaigns(prev => prev.map(campaign => 
        campaign._id === campaignId 
          ? { ...campaign, status: 'sending' }
          : campaign
      ));
      
      toast({
        title: "Campaign Resumed",
        description: "Campaign has been resumed.",
      });
    } catch (error: any) {
      console.error('Error resuming campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to resume campaign",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sending':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-600" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (progress: any) => {
    if (!progress || progress.total === 0) return 0;
    return Math.round(((progress.sent + progress.failed) / progress.total) * 100);
  };

  if (showNewForm) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <NewBroadcastForm 
            onClose={() => setShowNewForm(false)}
            onSubmit={handleNewBroadcast}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Broadcast Campaigns</h1>
            <p className="text-gray-600">Create and manage your WhatsApp broadcast campaigns</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Broadcast
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              All Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No campaigns found. Create your first broadcast!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(campaign.status)}
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          Scheduled: {format(new Date(campaign.scheduledAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        
                        {/* Action buttons */}
                        {campaign.status === 'sending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseCampaign(campaign._id)}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResumeCampaign(campaign._id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {['scheduled', 'sending', 'paused'].includes(campaign.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelCampaign(campaign._id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Total</span>
                        </div>
                        <p className="font-semibold">{campaign.progress?.total || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Send className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-500">Sent</span>
                        </div>
                        <p className="font-semibold text-blue-600">{campaign.progress?.sent || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-500">Delivered</span>
                        </div>
                        <p className="font-semibold text-green-600">{campaign.progress?.delivered || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-500">Read</span>
                        </div>
                        <p className="font-semibold text-purple-600">{campaign.progress?.read || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-500">Failed</span>
                        </div>
                        <p className="font-semibold text-red-600">{campaign.progress?.failed || 0}</p>
                      </div>
                    </div>
                    
                    {['sending', 'paused'].includes(campaign.status) && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgressPercentage(campaign.progress)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(campaign.progress)} className="w-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}