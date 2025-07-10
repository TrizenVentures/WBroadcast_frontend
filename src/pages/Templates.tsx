
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTemplates, Template } from "@/hooks/useTemplates";
import { TemplateForm } from "@/components/TemplateForm";
import { Layout } from "@/components/Layout";
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  MessageSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting
  } = useTemplates({
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const filteredTemplates = templates.filter((template) => {
    const searchRegex = new RegExp(searchTerm, "i");
    return searchRegex.test(template.name) || searchRegex.test(template.body);
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-400 text-white";
      case "pending":
        return "bg-yellow-400 text-gray-800";
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateTemplate = (data: any) => {
    createTemplate({
      name: data.name,
      body: data.body,
      variables: data.variables,
      category: data.category,
      language: data.language
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleUpdateTemplate = (data: any) => {
    if (selectedTemplate) {
      updateTemplate({ 
        id: selectedTemplate._id, 
        data: {
          name: data.name,
          body: data.body,
          variables: data.variables,
          category: data.category,
          language: data.language
        }
      });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Message Templates
            </CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Templates are used to create plain text messages for WhatsApp. 
                The message body will be sent directly as text content with variable substitution.
              </p>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="col-span-1 md:col-span-2">
                <Input
                  type="search"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-1 flex items-center space-x-2">
                <Select onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isLoading ? (
              <div className="mt-6 text-center">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="mt-6 text-center">No templates found.</div>
            ) : (
              <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <CardTitle className="text-lg font-semibold text-gray-800">{template.name}</CardTitle>
                      <Badge className={getStatusBadgeColor(template.status)}>{template.status}</Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-gray-600">{template.body.substring(0, 100)}...</p>
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreviewTemplate(template)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template._id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Template Dialog */}
      <TemplateForm 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTemplate}
        isLoading={isCreating}
      />

      {/* Edit Template Dialog */}
      <TemplateForm 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        template={selectedTemplate}
        onSubmit={handleUpdateTemplate}
        isLoading={isUpdating}
      />

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <Card className="w-full">
            {selectedTemplate && (
              <>
                <CardHeader>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedTemplate.body}</p>
                </CardContent>
              </>
            )}
          </Card>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
