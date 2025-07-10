import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Users, FileText, Clock, Send, Calendar } from "lucide-react";
import { templateApi, contactApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface NewBroadcastFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function NewBroadcastForm({ onClose, onSubmit }: NewBroadcastFormProps) {
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [provider, setProvider] = useState("auto");

  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadContacts();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateApi.getAll({ status: 'approved' });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactApi.getAll({ status: 'active', limit: 1000 });
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    }
  };

  const selectedTemplateData = templates.find(t => t._id === selectedTemplate);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c._id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Validation Error",
        description: "Please select a template",
        variant: "destructive"
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one contact",
        variant: "destructive"
      });
      return;
    }

    if (scheduleType === "schedule" && (!scheduleDate || !scheduleTime)) {
      toast({
        title: "Validation Error",
        description: "Please select date and time for scheduling",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let scheduledAt;
      if (scheduleType === "now") {
        scheduledAt = new Date();
      } else {
        scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledAt <= new Date()) {
          toast({
            title: "Validation Error",
            description: "Scheduled time must be in the future",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      const data = {
        name: campaignName,
        templateId: selectedTemplate,
        contactIds: selectedContacts,
        variables,
        scheduledAt: scheduledAt.toISOString(),
        rateLimitPerMinute,
        provider: "whatsapp"
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRecipients = selectedContacts.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Create New Broadcast
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="space-y-3">
              <Label>Template Preview</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedTemplateData.body}</p>
              </div>

              {selectedTemplateData.variables && selectedTemplateData.variables.length > 0 && (
                <div className="space-y-3">
                  <Label>Template Variables</Label>
                  {selectedTemplateData.variables.map((variable: any) => (
                    <div key={variable.name} className="space-y-1">
                      <Label htmlFor={variable.name} className="text-sm font-normal">
                        {variable.name} {variable.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={variable.name}
                        value={variables[variable.name] || ""}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable.name]: e.target.value }))}
                        placeholder={`Enter value for {{${variable.name}}}`}
                        required={variable.required}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Contacts</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllContacts}
              >
                {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${selectedContacts.includes(contact._id)
                    ? "bg-green-50 border-green-200"
                    : "bg-white hover:bg-gray-50"
                    }`}
                  onClick={() => handleContactToggle(contact._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <div>
                        <span className="font-medium">{contact.name}</span>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-1">
                        {contact.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalRecipients > 0 && (
              <div className="text-sm text-gray-600">
                Total recipients: <span className="font-semibold">{totalRecipients.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Schedule</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Send Now</SelectItem>
                <SelectItem value="schedule">Schedule for Later</SelectItem>
              </SelectContent>
            </Select>

            {scheduleType === "schedule" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="scheduleDate">Date</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="scheduleTime">Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimitPerMinute">Rate Limit (messages per minute)</Label>
            <Input
              id="rateLimitPerMinute"
              type="number"
              value={rateLimitPerMinute}
              onChange={(e) => setRateLimitPerMinute(parseInt(e.target.value) || 1000)}
              min={1}
              max={1000}
              placeholder="1000"
            />
            <p className="text-xs text-gray-500">
              Default: 1000 messages per minute (WhatsApp Cloud API's rate limit)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Messaging Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Choose messaging provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp Business API</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Using WhatsApp Cloud API for plain text message delivery
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading || !campaignName || !selectedTemplate || selectedContacts.length === 0}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  {scheduleType === "now" ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Broadcast
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
