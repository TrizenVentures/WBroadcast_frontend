
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Key, 
  Webhook, 
  Phone,
  Building,
  Save
} from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your WhatsApp Business API configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input 
                  id="accessToken" 
                  type="password" 
                  placeholder="Enter your WhatsApp Business API access token"
                  defaultValue="EAAG..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input 
                  id="phoneNumberId" 
                  placeholder="Enter your phone number ID"
                  defaultValue="123456789012345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appId">App ID</Label>
                <Input 
                  id="appId" 
                  placeholder="Enter your WhatsApp App ID"
                  defaultValue="987654321098765"
                />
              </div>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save API Settings
              </Button>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input 
                  id="webhookUrl" 
                  placeholder="https://yourapp.com/webhook"
                  defaultValue="https://yourapp.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <Input 
                  id="verifyToken" 
                  placeholder="Enter webhook verify token"
                  defaultValue="your_verify_token"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Webhook Settings
              </Button>
            </CardContent>
          </Card>

          {/* Phone Number Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Phone Number Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phone Number:</span>
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Rating:</span>
                <Badge className="bg-blue-100 text-blue-800">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Messaging Type:</span>
                <Badge className="bg-green-100 text-green-800">Plain Text</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  placeholder="Enter your business name"
                  defaultValue="Your Business Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Input 
                  id="businessDescription" 
                  placeholder="Enter business description"
                  defaultValue="We provide excellent customer service"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessWebsite">Website</Label>
                <Input 
                  id="businessWebsite" 
                  placeholder="https://yourbusiness.com"
                  defaultValue="https://yourbusiness.com"
                />
              </div>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Messaging Mode:</strong> Your WhatsApp Business API is configured for plain text messaging. 
                  Templates are used for content organization and variable substitution only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
