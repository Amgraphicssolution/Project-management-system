import { useState } from "react";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { OrganizationType } from "@/types/index";
import CreateOrganizationModal from "./CreateOrganizationModal";
import OrganizationEditor from "./OrganizationEditor";

interface OrganizationSwitcherProps {
  currentOrganization: OrganizationType;
  organizations: OrganizationType[];
  onOrganizationChange: (organization: OrganizationType) => void;
  onCreateOrganization: (name: string, image?: string) => void;
  onUpdateOrganization?: (id: string, name: string, image?: string) => void;
  onDeleteOrganization?: (id: string) => void;
  isAdmin?: boolean;
  className?: string;
}

export default function OrganizationSwitcher({
  currentOrganization,
  organizations = [],
  onOrganizationChange,
  onCreateOrganization,
  onUpdateOrganization,
  onDeleteOrganization,
  isAdmin = true,
  className = ""
}: OrganizationSwitcherProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState<OrganizationType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Guard against invalid currentOrganization
  if (!currentOrganization || !currentOrganization.id) {
    return null;
  }

  const handleCreateClick = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (org: OrganizationType) => {
    setIsOpen(false);
    setOrganizationToEdit(org);
    setIsEditModalOpen(true);
  };

  const handleCreateOrganization = (name: string, image?: string) => {
    // Pass the name and image directly to the parent handler
    onCreateOrganization(name, image);
    setIsCreateModalOpen(false);
  };

  const handleUpdateOrganization = (id: string, name: string, image?: string) => {
    if (onUpdateOrganization) {
      onUpdateOrganization(id, name, image);
    }
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={`h-auto px-2 py-1.5 flex items-center gap-2 hover:bg-secondary/50 w-full justify-start ${className}`}>
            <Avatar className="h-6 w-6">
              {currentOrganization.image ? (
                <AvatarImage src={currentOrganization.image} />
              ) : (
                <AvatarFallback>
                  {currentOrganization.name?.substring(0, 2).toUpperCase() || "OR"}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium text-sm truncate flex-1 text-left">{currentOrganization.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-2" 
          align="center" 
          side="top" 
          sideOffset={8}
          alignOffset={0}
        >
          <div className="space-y-1">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center">
                <Button
                  variant={org.id === currentOrganization.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 px-2 py-1.5 h-auto flex-1"
                  onClick={() => {
                    onOrganizationChange(org);
                    setIsOpen(false);
                  }}
                >
                  <Avatar className="h-5 w-5">
                    {org.image ? (
                      <AvatarImage src={org.image} />
                    ) : (
                      <AvatarFallback>
                        {org.name?.substring(0, 2).toUpperCase() || "OR"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm truncate">{org.name}</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-1"
                    onClick={() => handleEditClick(org)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 px-2 py-1.5 h-auto text-primary"
              onClick={handleCreateClick}
            >
              <div className="h-5 w-5 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm">Add Organization</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrganization={handleCreateOrganization}
      />

      {organizationToEdit && (
        <OrganizationEditor
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          organization={organizationToEdit}
          onUpdateOrganization={handleUpdateOrganization}
          onDeleteOrganization={onDeleteOrganization}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
} 