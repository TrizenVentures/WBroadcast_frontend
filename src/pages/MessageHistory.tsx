
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampaignMessages } from "@/hooks/useCampaignMessages";
import { campaignApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageSquare,
  Calendar
} from "lucide-react";

export default function MessageHistory() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch campaigns for the dropdown
  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignApi.getAll(),
  });

  const campaigns = campaignsData?.data || [];

  // Fetch messages for the selected campaign
  const { messages, isLoading } = useCampaignMessages(selectedCampaign, {
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const filteredMessages = messages.filter(message => {
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      return searchRegex.test(message.contact.name) || 
             searchRegex.test(message.contact.phone) || 
             searchRegex.test(message.messageContent);
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
            <p className="text-gray-600">
              View messages from campaigns and their delivery status
              {selectedCampaign && ` (${filteredMessages.length} messages)`}
            </p>
          </div>
        </div>

        {/* Campaign Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign to view messages" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign: any) => (
                    <SelectItem key={campaign._id} value={campaign._id}>
                      {campaign.name} ({campaign.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search messages..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Campaign Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCampaign ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Please select a campaign to view its messages</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No messages found for the selected campaign</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{message.contact.name}</h4>
                        <p className="text-sm text-gray-500">{message.contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {message.messageContent}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Status: {message.status}</span>
                      {message.errorMessage && (
                        <span className="text-red-500">Error: {message.errorMessage}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                      {message.whatsappMessageId && (
                        <span className="text-xs text-gray-400">
                          WhatsApp ID: {message.whatsappMessageId.substring(0, 20)}...
                        </span>
                      )}
                      {message.sentAt && (
                        <span className="text-xs text-gray-400">
                          Sent: {new Date(message.sentAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
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
