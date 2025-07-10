
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Eye } from 'lucide-react';
import { Template, CreateTemplateData } from '@/hooks/useTemplates';

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
}

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
  onSubmit: (data: CreateTemplateData) => void;
  isLoading: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  open,
  onOpenChange,
  template,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    body: '',
    variables: [],
    category: 'MARKETING',
    language: 'EN',
  });
  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    name: '',
    type: 'text',
    required: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        body: template.body,
        variables: template.variables,
        category: template.category,
        language: template.language,
      });
    } else {
      setFormData({
        name: '',
        body: '',
        variables: [],
        category: 'MARKETING',
        language: 'EN',
      });
    }
  }, [template, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariable = () => {
    if (newVariable.name.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }],
      }));
      setNewVariable({ name: '', type: 'text', required: false });
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const extractVariablesFromBody = () => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = formData.body.match(regex);
    if (matches) {
      const extractedVars = matches.map(match => match.slice(2, -2));
      const uniqueVars = [...new Set(extractedVars)];
      const newVars = uniqueVars
        .filter(varName => !formData.variables.some(v => v.name === varName))
        .map(varName => ({ name: varName, type: 'text' as const, required: false }));
      
      if (newVars.length > 0) {
        setFormData(prev => ({
          ...prev,
          variables: [...prev.variables, ...newVars],
        }));
      }
    }
  };

  const generatePreview = () => {
    let preview = formData.body;
    formData.variables.forEach(variable => {
      const placeholder = `[${variable.name.toUpperCase()}]`;
      preview = preview.replace(new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'), placeholder);
    });
    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Message"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'MARKETING' | 'TRANSACTIONAL' | 'UTILITY') =>
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Category is for organization purposes. Messages will be sent as plain text.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message Body</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={extractVariablesFromBody}
                >
                  Extract Variables
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Hello {{name}}, welcome to our service! This message will be sent as plain text via WhatsApp."
              rows={4}
              required
            />
            <p className="text-sm text-gray-500">
              Use double curly braces for variables: {`{{variable_name}}`}. This content will be sent as plain text via WhatsApp.
            </p>
          </div>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <p className="whitespace-pre-wrap">{generatePreview()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Variables</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                  className="w-32"
                />
                <Select
                  value={newVariable.type}
                  onValueChange={(value: 'text' | 'number' | 'date') =>
                    setNewVariable(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" onClick={addVariable}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {formData.variables.length > 0 && (
              <div className="space-y-2">
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Badge variant="outline">
                      {`{{${variable.name}}}`}
                    </Badge>
                    <Badge variant="secondary">{variable.type}</Badge>
                    {variable.required && <Badge variant="destructive">Required</Badge>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
