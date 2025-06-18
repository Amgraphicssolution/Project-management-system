import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { OrganizationType } from "@/types/index";

interface OrganizationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationType;
  onUpdateOrganization: (id: string, name: string, image?: string) => void;
  onDeleteOrganization?: (id: string) => void;
  isAdmin?: boolean;
}

export default function OrganizationEditor({
  isOpen,
  onClose,
  organization,
  onUpdateOrganization,
  onDeleteOrganization,
  isAdmin = true
}: OrganizationEditorProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Initialize state when organization changes or component mounts
  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
      setImage(organization.image);
    }
  }, [organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization) return;
    
    try {
      setIsSubmitting(true);
      onUpdateOrganization(organization.id, name.trim(), image);
    } catch (error) {
      console.error("Error updating organization:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirmDelete && onDeleteOrganization && organization) {
      try {
        onDeleteOrganization(organization.id);
        onClose();
      } catch (error) {
        console.error("Error deleting organization:", error);
      }
    } else {
      setConfirmDelete(true);
    }
  };

  const handleClose = () => {
    if (organization) {
      setName(organization.name || "");
      setImage(organization.image);
    }
    setConfirmDelete(false);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // If no organization is provided, don't render
  if (!organization) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update the organization details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                {image ? (
                  <AvatarImage src={image} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {name ? name.substring(0, 2).toUpperCase() : organization.name?.substring(0, 2).toUpperCase() || "ORG"}
                  </AvatarFallback>
                )}
              </Avatar>
              {isAdmin && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Label htmlFor="image-upload-edit" className="cursor-pointer">
                    <Upload className="h-5 w-5 text-white" />
                  </Label>
                  <Input 
                    id="image-upload-edit" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              required
              autoFocus
              disabled={!isAdmin}
            />
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {isAdmin && onDeleteOrganization && !organization.isDefault && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                >
                  {confirmDelete ? "Confirm Delete" : "Delete Organization"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {isAdmin && (
                <Button type="submit" disabled={!name.trim() || isSubmitting}>
                  Save Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 