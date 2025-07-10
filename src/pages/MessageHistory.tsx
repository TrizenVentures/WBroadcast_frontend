
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageSquare
} from "lucide-react";

export default function MessageHistory() {
  const messages = [
    {
      id: 1,
      contact: "John Doe",
      phone: "+1234567890",
      message: "Hello John, welcome to our service!",
      status: "delivered",
      timestamp: "2024-01-15 10:30 AM",
      campaign: "New Product Launch",
      whatsappMessageId: "wamid.HBgLMTIzNDU2Nzg5MAA="
    },
    {
      id: 2,
      contact: "Jane Smith",
      phone: "+1234567891",
      message: "Your order #12345 has been confirmed",
      status: "read",
      timestamp: "2024-01-15 09:15 AM",
      campaign: "Order Notifications",
      whatsappMessageId: "wamid.HBgLMTIzNDU2Nzg5MQA="
    },
    {
      id: 3,
      contact: "Bob Wilson",
      phone: "+1234567892",
      message: "Payment reminder for invoice #INV-001",
      status: "failed",
      timestamp: "2024-01-14 02:45 PM",
      campaign: "Payment Reminders",
      whatsappMessageId: null
    },
  ];

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
            <p className="text-gray-600">View all sent messages and their delivery status</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                All Messages
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search messages..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{message.contact}</h4>
                        <p className="text-sm text-gray-500">{message.phone}</p>
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
                      {message.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Campaign: {message.campaign}</span>
                    <div className="flex flex-col items-end">
                      <span>{message.timestamp}</span>
                      {message.whatsappMessageId && (
                        <span className="text-xs text-gray-400">
                          ID: {message.whatsappMessageId.substring(0, 20)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
