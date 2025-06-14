import React, { useState, useEffect } from 'react';
import {
  FormInput,
  GripVertical,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Calendar,
  Check,
  FileText,
  Mail,
  Link,
  Phone,
  Hash,
  CheckSquare,
  X,
  Settings,
  Info,
  LayoutGrid,
  Type,
  List,
  ListOrdered,
  Quote,
  Table,
  Minus,
  Image,
  Video,
  Music,
  FileIcon,
  Code,
  Layout,
  ListTree,
  ExternalLink,
  Figma,
  FileDigit,
  Search
} from 'lucide-react';
import { cn, shouldUseTopAlignedGrip } from '@/lib/utils';
import { BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// Define block categories for conversion
const blockCategories = [
  {
    name: "Basic Blocks",
    blocks: [
      { type: 'paragraph', icon: FileText, label: 'Text' },
      { type: 'heading-1', icon: Type, label: 'H1 Heading' },
      { type: 'heading-2', icon: Type, label: 'H2 Heading' },
      { type: 'heading-3', icon: Type, label: 'H3 Heading' },
      { type: 'heading-4', icon: Type, label: 'H4 Heading' },
      { type: 'heading-5', icon: Type, label: 'H5 Heading' },
      { type: 'heading-6', icon: Type, label: 'H6 Heading' },
      { type: 'bullet-list', icon: List, label: 'Bullet List' },
      { type: 'number-list', icon: ListOrdered, label: 'Number List' },
      { type: 'to-do', icon: CheckSquare, label: 'To-do List' },
      { type: 'toggle', icon: List, label: 'Toggle List' },
      { type: 'quote', icon: Quote, label: 'Quote' },
      { type: 'table', icon: Table, label: 'Table' },
      { type: 'divider', icon: Minus, label: 'Divider' },
      { type: 'code', icon: Code, label: 'Code' },
    ]
  },
  {
    name: "Media",
    blocks: [
      { type: 'image', icon: Image, label: 'Image' },
      { type: 'video', icon: Video, label: 'Video' },
      { type: 'audio', icon: Music, label: 'Audio' },
      { type: 'file', icon: FileIcon, label: 'File' },
    ]
  },
  {
    name: "Advanced Blocks",
    blocks: [
      { type: 'board', icon: Layout, label: 'Board' },
      { type: 'form', icon: FormInput, label: 'Form' },
      { type: 'table-of-contents', icon: ListTree, label: 'Table of Content' },
      { type: 'two-columns', icon: Layout, label: '2 Column' },
      { type: 'three-columns', icon: Layout, label: '3 Column' },
      { type: 'four-columns', icon: Layout, label: '4 Column' },
      { type: 'five-columns', icon: Layout, label: '5 Column' },
    ]
  },
  {
    name: "Embeds",
    blocks: [
      { type: 'embed', icon: ExternalLink, label: 'Embed' },
      { type: 'figma', icon: Figma, label: 'Figma' },
      { type: 'pdf', icon: FileDigit, label: 'PDF' },
      { type: 'adobe', icon: FileIcon, label: 'Adobe' },
    ]
  }
];

// Define form field types
const formFieldTypes = [
  { type: 'text', icon: FileText, label: 'Text' },
  { type: 'multiple-choice', icon: CheckSquare, label: 'Multiple Choice' },
  { type: 'date', icon: Calendar, label: 'Date' },
  { type: 'file', icon: FileText, label: 'Files & Media' },
  { type: 'number', icon: Hash, label: 'Number' },
  { type: 'checkbox', icon: Check, label: 'Checkbox' },
  { type: 'email', icon: Mail, label: 'Email' },
  { type: 'url', icon: Link, label: 'URL' },
  { type: 'phone', icon: Phone, label: 'Phone' },
];

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  description?: string;
  options?: string[];
  maxSelections?: number;
  allowEndDate?: boolean;
  textType?: 'short' | 'long';
}

// FormPreview component
interface FormPreviewProps {
  formData: {
    title: string;
    description: string;
    fields: FormField[];
  };
  onSubmit: (response: any) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ formData, onSubmit }) => {
  // Initialize with safe default values
  const safeFormData = {
    title: formData?.title || 'Form',
    description: formData?.description || '',
    fields: Array.isArray(formData?.fields) ? formData.fields : []
  };
  
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    safeFormData.fields.forEach(field => {
      if (field.required) {
        const value = formValues[field.id];
        
        if (value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = 'This field is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Create response object
      const response = {
        data: formValues,
        submittedAt: new Date().toISOString()
      };
      
      // Submit the response
      onSubmit(response);
      
      // Show success message
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return field.textType === 'long' ? (
          <Textarea 
            id={field.id}
            placeholder="Your answer" 
            className="w-full" 
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        ) : (
          <Input 
            id={field.id}
            placeholder="Your answer" 
            className="w-full" 
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        );
      
      case 'multiple-choice':
        return field.maxSelections === 1 ? (
          <RadioGroup 
            value={formValues[field.id] || ''} 
            onValueChange={(value) => handleInputChange(field.id, value)}
            disabled={isSubmitting || isSubmitted}
          >
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-option-${index}`} />
                  <Label htmlFor={`${field.id}-option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const values = formValues[field.id] || [];
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${field.id}-option-${index}`}
                    checked={values.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange(field.id, [...(formValues[field.id] || []), option]);
                      } else {
                        handleInputChange(
                          field.id, 
                          (formValues[field.id] || []).filter((item: string) => item !== option)
                        );
                      }
                    }}
                    disabled={isSubmitting || isSubmitted}
                  />
                  <Label htmlFor={`${field.id}-option-${index}`}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-4">
            <Input 
              type="date" 
              className="w-full"
              value={Array.isArray(formValues[field.id]) ? formValues[field.id][0] : (formValues[field.id] || '')}
              onChange={(e) => {
                if (field.allowEndDate) {
                  handleInputChange(field.id, [
                    e.target.value, 
                    Array.isArray(formValues[field.id]) ? formValues[field.id][1] : ''
                  ]);
                } else {
                  handleInputChange(field.id, e.target.value);
                }
              }}
              disabled={isSubmitting || isSubmitted}
            />
            {field.allowEndDate && (
              <>
                <div className="text-sm text-muted-foreground">End date</div>
                <Input 
                  type="date" 
                  className="w-full"
                  value={Array.isArray(formValues[field.id]) ? formValues[field.id][1] : ''}
                  onChange={(e) => {
                    handleInputChange(field.id, [
                      Array.isArray(formValues[field.id]) ? formValues[field.id][0] : '',
                      e.target.value
                    ]);
                  }}
                  disabled={isSubmitting || isSubmitted}
                />
              </>
            )}
          </div>
        );
      
      case 'number':
        return (
          <Input 
            type="number" 
            className="w-full"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const values = formValues[field.id] || [];
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${field.id}-option-${index}`}
                    checked={values.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange(field.id, [...(formValues[field.id] || []), option]);
                      } else {
                        handleInputChange(
                          field.id, 
                          (formValues[field.id] || []).filter((item: string) => item !== option)
                        );
                      }
                    }}
                    disabled={isSubmitting || isSubmitted}
                  />
                  <Label htmlFor={`${field.id}-option-${index}`}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      
      case 'email':
        return (
          <Input 
            type="email" 
            className="w-full"
            placeholder="email@example.com"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        );
      
      case 'url':
        return (
          <Input 
            type="url" 
            className="w-full"
            placeholder="https://example.com"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        );
      
      case 'phone':
        return (
          <Input 
            type="tel" 
            className="w-full"
            placeholder="+1 (555) 000-0000"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={isSubmitting || isSubmitted}
          />
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed rounded-md p-6 text-center text-muted-foreground">
            {isSubmitted ? 'Files uploaded' : 'Click to upload or drag and drop files here'}
          </div>
        );
      
      default:
        return <Input className="w-full" disabled={isSubmitting || isSubmitted} />;
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-medium">Response submitted</h3>
        <p className="text-muted-foreground">Thank you for completing this form.</p>
        <Button className="mt-4" onClick={() => {
          const closeButton = document.querySelector('[data-dialog-close]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {safeFormData.description && (
        <p className="text-muted-foreground">{safeFormData.description}</p>
      )}
      
      {safeFormData.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <div className="flex items-baseline">
            <Label htmlFor={field.id} className="font-medium">
              {field.label}
            </Label>
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </div>
          
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          
          {renderField(field)}
          
          {errors[field.id] && (
            <p className="text-sm text-red-500">{errors[field.id]}</p>
          )}
        </div>
      ))}
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || isSubmitted}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

interface FormBlockProps {
  block: BlockType;
  onUpdate: (updatedBlock: BlockType) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onConvert?: (newType: BlockType['type']) => void;
}

const FormBlock: React.FC<FormBlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert
}) => {
  // Parse form data from block content or initialize new form
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    fields: FormField[];
    activeTab: string;
    responses?: any[];
  }>(() => {
    try {
      // Safely parse the block content
      let parsedData = null;
      if (block && block.content) {
        try {
          parsedData = JSON.parse(block.content);
        } catch (parseError) {
          console.error("Error parsing form block content:", parseError);
        }
      }
      
      // Return parsed data or default
      return parsedData || {
        title: 'Form title',
        description: 'Description (optional)',
        fields: [],
        activeTab: 'form-builder',
        responses: []
      };
    } catch (e) {
      console.error("Error initializing form block:", e);
      return {
        title: 'Form title',
        description: 'Description (optional)',
        fields: [],
        activeTab: 'form-builder',
        responses: []
      };
    }
  });

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [addingField, setAddingField] = useState<boolean>(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showFieldSettings, setShowFieldSettings] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Update parent component when form data changes
  useEffect(() => {
    onUpdate({
      ...block,
      content: JSON.stringify(formData)
    });
  }, [formData]);

  // Generate unique ID for new fields
  const generateId = () => `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Add a new field to the form
  const addField = (type: string) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} question`,
      required: false,
      description: '',
      options: type === 'multiple-choice' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      maxSelections: type === 'multiple-choice' ? 1 : undefined,
      allowEndDate: type === 'date' ? false : undefined,
      textType: type === 'text' ? 'short' : undefined
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setAddingField(false);
    setEditingFieldId(newField.id);
  };

  // Update a field
  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  // Delete a field
  const deleteField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id)
    }));
    setEditingFieldId(null);
  };

  // Move a field up or down
  const moveField = (id: string, direction: 'up' | 'down') => {
    const fieldIndex = formData.fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && fieldIndex === 0) ||
      (direction === 'down' && fieldIndex === formData.fields.length - 1)
    ) {
      return;
    }

    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];

    setFormData(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  // Add option to multiple choice field
  const addOption = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId && field.options) {
          return {
            ...field,
            options: [...field.options, `Option ${field.options.length + 1}`]
          };
        }
        return field;
      })
    }));
  };

  // Update option text
  const updateOption = (fieldId: string, optionIndex: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId && field.options) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = text;
          return {
            ...field,
            options: newOptions
          };
        }
        return field;
      })
    }));
  };

  // Delete option from multiple choice field
  const deleteOption = (fieldId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId && field.options && field.options.length > 1) {
          return {
            ...field,
            options: field.options.filter((_, index) => index !== optionIndex)
          };
        }
        return field;
      })
    }));
  };

  // Render field based on type
  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return field.textType === 'long' ? (
          <Textarea 
            placeholder="Long answer text" 
            className="w-full mt-1" 
            disabled 
          />
        ) : (
          <Input 
            placeholder="Short answer text" 
            className="w-full mt-1" 
            disabled 
          />
        );
      
      case 'multiple-choice':
        return (
          <div className="mt-1 space-y-2">
            {field.maxSelections === 1 ? (
              <RadioGroup value={field.options?.[0] || ""} disabled>
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5 transition-colors">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="flex-shrink-0">
                        <RadioGroupItem value={option} id={`${field.id}-option-${index}`} />
                      </div>
                      <Label htmlFor={`${field.id}-option-${index}`} className="flex-grow font-medium">{option}</Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <>
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5 transition-colors">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="flex-shrink-0">
                        <Checkbox id={`${field.id}-option-${index}`} disabled />
                      </div>
                      <Label htmlFor={`${field.id}-option-${index}`} className="flex-grow font-medium">{option}</Label>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      
      case 'date':
        return (
          <div className="mt-1 space-y-2">
            <Input type="date" className="w-full" disabled />
            {field.allowEndDate && (
              <>
                <div className="text-sm text-muted-foreground">End date</div>
                <Input type="date" className="w-full" disabled />
              </>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="mt-1 border-2 border-dashed rounded-md p-6 text-center text-muted-foreground">
            Click to upload or drag and drop files here
          </div>
        );
      
      case 'number':
        return <Input type="number" className="w-full mt-1" disabled />;
      
      case 'checkbox':
        return (
          <div className="mt-1 space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/5 transition-colors">
                <div className="flex items-center space-x-2 w-full">
                  <div className="flex-shrink-0">
                    <Checkbox id={`${field.id}-option-${index}`} disabled />
                  </div>
                  <Label htmlFor={`${field.id}-option-${index}`} className="flex-grow font-medium">{option}</Label>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'email':
        return <Input type="email" className="w-full mt-1" placeholder="email@example.com" disabled />;
      
      case 'url':
        return <Input type="url" className="w-full mt-1" placeholder="https://example.com" disabled />;
      
      case 'phone':
        return <Input type="tel" className="w-full mt-1" placeholder="+1 (555) 000-0000" disabled />;
      
      default:
        return <Input className="w-full mt-1" disabled />;
    }
  };

  // Render field settings
  const renderFieldSettings = (field: FormField) => {
         const commonSettings = (
       <>
         <div className="space-y-2 mb-4">
           <Label htmlFor={`${field.id}-label`} className="text-sm font-medium">Question</Label>
           <Input
             id={`${field.id}-label`}
             value={field.label}
             onChange={(e) => updateField(field.id, { label: e.target.value })}
             className="w-full"
             placeholder="Enter your question"
           />
         </div>
         
         <div className="space-y-2 mb-4 border rounded-md p-3 bg-accent/5">
           <div className="flex items-center justify-between">
             <div>
               <Label htmlFor={`${field.id}-has-description`} className="text-sm font-medium">Description</Label>
               <p className="text-xs text-muted-foreground">Add extra context to your question</p>
             </div>
             <Switch
               id={`${field.id}-has-description`}
               checked={!!field.description}
               onCheckedChange={(checked) => updateField(field.id, { 
                 description: checked ? 'Add some description text here' : '' 
               })}
             />
           </div>
           {field.description && (
             <Textarea
               id={`${field.id}-description`}
               value={field.description}
               onChange={(e) => updateField(field.id, { description: e.target.value })}
               className="w-full mt-2"
               placeholder="Add description text"
               rows={2}
             />
           )}
         </div>
         
         <div className="flex items-center justify-between mb-4 border rounded-md p-3 bg-accent/5">
           <div>
             <Label htmlFor={`${field.id}-required`} className="text-sm font-medium">Required</Label>
             <p className="text-xs text-muted-foreground">Make this field mandatory</p>
           </div>
           <Switch
             id={`${field.id}-required`}
             checked={field.required}
             onCheckedChange={(checked) => updateField(field.id, { required: checked })}
           />
         </div>
       </>
     );

    // Type-specific settings
    switch (field.type) {
      case 'text':
        return (
          <div className="p-4 space-y-4">
            {commonSettings}
            <div className="space-y-2">
              <Label>Response type</Label>
              <RadioGroup 
                value={field.textType} 
                onValueChange={(value) => updateField(field.id, { textType: value as 'short' | 'long' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id={`${field.id}-short`} />
                  <Label htmlFor={`${field.id}-short`}>Short answer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id={`${field.id}-long`} />
                  <Label htmlFor={`${field.id}-long`}>Paragraph</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="p-4 space-y-4">
            {commonSettings}
                         <div className="space-y-2">
               <Label className="text-sm font-medium">Options</Label>
               <div className="space-y-2 border rounded-md p-2 bg-accent/5">
                 {field.options?.map((option, index) => (
                   <div 
                     key={index} 
                     className="flex items-center space-x-2 p-2 rounded-md bg-background border hover:shadow-sm transition-all"
                   >
                     <div className="flex-shrink-0 mr-2 text-muted-foreground">
                       {field.maxSelections === 1 ? (
                         <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                           <div className="h-2 w-2 rounded-full bg-primary"></div>
                         </div>
                       ) : (
                         <div className="h-4 w-4 rounded-sm border border-primary flex items-center justify-center">
                           <Check className="h-3 w-3 text-primary" />
                         </div>
                       )}
                     </div>
                     <Input
                       value={option}
                       onChange={(e) => updateOption(field.id, index, e.target.value)}
                       className="flex-1"
                       placeholder="Option text"
                     />
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => deleteOption(field.id, index)}
                       disabled={field.options?.length === 1}
                       className="text-muted-foreground hover:text-destructive"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
                 <Button
                   variant="outline"
                   size="sm"
                   className="w-full mt-2 border-dashed"
                   onClick={() => addOption(field.id)}
                 >
                   <Plus className="h-4 w-4 mr-2" /> Add option
                 </Button>
               </div>
             </div>
                         <div className="space-y-2">
               <Label className="text-sm font-medium">Selection type</Label>
               <div className="grid grid-cols-2 gap-2 mt-1">
                 <button
                   type="button"
                   className={cn(
                     "flex flex-col items-center justify-center p-3 rounded-md border",
                     field.maxSelections === 1 
                       ? "bg-primary/10 border-primary/30 ring-1 ring-primary" 
                       : "bg-background hover:bg-accent/5"
                   )}
                   onClick={() => updateField(field.id, { maxSelections: 1 })}
                 >
                   <div className="h-6 w-6 rounded-full border border-primary flex items-center justify-center mb-2">
                     <div className="h-3 w-3 rounded-full bg-primary"></div>
                   </div>
                   <span className="text-xs font-medium">Single choice</span>
                   <span className="text-xs text-muted-foreground mt-1">Select one option only</span>
                 </button>
                 <button
                   type="button"
                   className={cn(
                     "flex flex-col items-center justify-center p-3 rounded-md border",
                     field.maxSelections !== 1 
                       ? "bg-primary/10 border-primary/30 ring-1 ring-primary" 
                       : "bg-background hover:bg-accent/5"
                   )}
                   onClick={() => updateField(field.id, { maxSelections: field.options?.length || 1 })}
                 >
                   <div className="h-6 w-6 rounded-sm border border-primary flex items-center justify-center mb-2">
                     <Check className="h-4 w-4 text-primary" />
                   </div>
                   <span className="text-xs font-medium">Multiple choice</span>
                   <span className="text-xs text-muted-foreground mt-1">Select multiple options</span>
                 </button>
               </div>
             </div>
          </div>
        );
      
      case 'date':
        return (
          <div className="p-4 space-y-4">
            {commonSettings}
            <div className="flex items-center justify-between">
              <Label htmlFor={`${field.id}-end-date`}>Allow end date</Label>
              <Switch
                id={`${field.id}-end-date`}
                checked={!!field.allowEndDate}
                onCheckedChange={(checked) => updateField(field.id, { allowEndDate: checked })}
              />
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="p-4 space-y-4">
            {commonSettings}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Options</Label>
              <div className="space-y-2 border rounded-md p-2 bg-accent/5">
                {field.options?.map((option, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-2 p-2 rounded-md bg-background border hover:shadow-sm transition-all"
                  >
                    <div className="flex-shrink-0 mr-2 text-muted-foreground">
                      <div className="h-4 w-4 rounded-sm border border-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(field.id, index, e.target.value)}
                      className="flex-1"
                      placeholder="Option text"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOption(field.id, index)}
                      disabled={field.options?.length === 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-dashed"
                  onClick={() => addOption(field.id)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add option
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="p-4 space-y-4">{commonSettings}</div>;
    }
  };

  // Render form builder tab
  const renderFormBuilder = () => (
    <div className="space-y-6">
      {/* Form Title and Description */}
      <div className="space-y-2">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full text-3xl font-bold bg-transparent border-none outline-none focus:ring-0"
          placeholder="Form title"
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full text-lg bg-transparent border-none outline-none resize-none focus:ring-0"
          placeholder="Description (optional)"
          rows={2}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {formData.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              "border rounded-lg p-4 relative transition-all",
              editingFieldId === field.id ? "ring-2 ring-primary" : "",
              "hover:shadow-sm"
            )}
            onClick={() => setEditingFieldId(field.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1 flex-1">
                <div className="font-medium">{field.label}</div>
                {field.description && (
                  <div className="text-sm text-muted-foreground">{field.description}</div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Field controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFieldSettings(showFieldSettings === field.id ? null : field.id);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => moveField(field.id, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4 mr-2" /> Move up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => moveField(field.id, 'down')} disabled={index === formData.fields.length - 1}>
                      <ArrowDown className="h-4 w-4 mr-2" /> Move down
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteField(field.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Field preview */}
            {renderFieldPreview(field)}
            
            {/* Required indicator */}
            {field.required && (
              <div className="absolute top-4 right-12 text-red-500 text-sm">*</div>
            )}
            
            {/* Field settings panel */}
            {showFieldSettings === field.id && (
              <div className="mt-4 border-t pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Field settings</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setShowFieldSettings(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderFieldSettings(field)}
              </div>
            )}
          </div>
        ))}
        
        {/* Add field button */}
        <div className="flex justify-center">
          <Popover open={addingField} onOpenChange={setAddingField}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-dashed">
                <Plus className="h-4 w-4 mr-2" /> Add field
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h4 className="text-sm font-medium mb-3">Add a field</h4>
              <div className="grid grid-cols-3 gap-3">
                {formFieldTypes.map(fieldType => (
                  <button
                    key={fieldType.type}
                    className="flex flex-col items-center justify-center h-24 p-3 rounded-md border bg-background hover:bg-accent/5 hover:border-primary/30 transition-all"
                    onClick={() => addField(fieldType.type)}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <fieldType.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  // Render responses tab
  const renderResponses = () => (
    <div className="p-4">
      {formData.responses && formData.responses.length > 0 ? (
        <div className="space-y-6">
          {formData.responses.map((response, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Response #{index + 1}</h4>
                <div className="text-sm text-muted-foreground">
                  {new Date(response.submittedAt).toLocaleString()}
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(response.data).map(([fieldId, value]) => {
                  const field = formData.fields.find(f => f.id === fieldId);
                  if (!field) return null;
                  
                  return (
                    <div key={fieldId} className="space-y-1">
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-sm p-2 bg-accent/5 rounded-md">
                        {Array.isArray(value) ? (
                          <ul className="list-disc pl-5">
                            {value.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{value.toString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No responses yet
        </div>
      )}
    </div>
  );

  // Main component render
  return (
    <div className="relative group">
      <div className="flex items-center group-hover:bg-accent/5 rounded-sm">
        <div className={cn(
          "flex-shrink-0 flex self-stretch opacity-0 group-hover:opacity-100 transition-opacity duration-100",
          shouldUseTopAlignedGrip(block.type) ? "items-start pt-4" : "items-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-[40px] h-8 flex items-center justify-center hover:bg-accent/10 rounded-sm cursor-grab"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={2} align="start" className="w-[160px]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Convert to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <div className="flex items-center gap-2 px-2 py-1.5 border-b">
                    <Search className="h-4 w-4 text-muted-foreground/70" />
                    <Input
                      type="text"
                      placeholder="Filter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 h-5 bg-transparent border-0 outline-none text-sm focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                    {blockCategories.map((category) => {
                      const filteredBlocks = category.blocks.filter(block =>
                        block.label.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      
                      if (filteredBlocks.length === 0) return null;
                      
                      return (
                        <div key={category.name}>
                          <DropdownMenuItem disabled className="opacity-50 pointer-events-none px-2">
                            {category.name}
                          </DropdownMenuItem>
                          {filteredBlocks.map((blockType) => (
                            <DropdownMenuItem 
                              key={blockType.type}
                              className="flex items-center gap-2 px-2"
                              onClick={() => onConvert && onConvert(blockType.type as BlockType['type'])}
                            >
                              <blockType.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{blockType.label}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="mx-2" />
                        </div>
                      );
                    })}
                    {!blockCategories.some(category => 
                      category.blocks.some(block => 
                        block.label.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    ) && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        No blocks found
                      </div>
                    )}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {onMoveUp && (
                <DropdownMenuItem onClick={onMoveUp} className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4" />
                  Move up
                </DropdownMenuItem>
              )}
              {onMoveDown && (
                <DropdownMenuItem onClick={onMoveDown} className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4" />
                  Move down
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <div 
            className="relative border rounded-lg shadow-sm my-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Form block content */}
            <div className="p-4">
              <Tabs 
                value={formData.activeTab} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, activeTab: value }))}
              >
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="form-builder">Form Builder</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">View Form</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{formData.title}</DialogTitle>
                        </DialogHeader>
                        {/* Wrap FormPreview in a try-catch to prevent rendering errors */}
                        {(() => {
                          try {
                            return (
                              <FormPreview 
                                formData={formData} 
                                onSubmit={(formResponse) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    responses: [...(prev.responses || []), formResponse]
                                  }));
                                }}
                              />
                            );
                          } catch (error) {
                            console.error("Error rendering FormPreview:", error);
                            return (
                              <div className="p-4 text-center text-red-500">
                                Error loading form preview. Please try again.
                              </div>
                            );
                          }
                        })()}
                      </DialogContent>
                    </Dialog>
                    <Button>Share form</Button>
                  </div>
                </div>
                
                <TabsContent value="form-builder" className="mt-0">
                  {renderFormBuilder()}
                </TabsContent>
                
                <TabsContent value="responses" className="mt-0">
                  {renderResponses()}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBlock; 