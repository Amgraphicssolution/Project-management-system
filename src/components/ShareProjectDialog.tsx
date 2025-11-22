import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectType } from "@/types";
import { Check, ChevronRight, X, ArrowLeft, Lock, Users, Building2, ChevronDown, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareProjectDialogProps {
  project: ProjectType;
  isOpen: boolean;
  onClose: () => void;
}

interface UserWithAccess {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

type AccessType = "private" | "clients" | "internal";
type UserRole = "Viewer" | "Commenter" | "Manager" | "Admin";

interface AccessOption {
  id: AccessType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface RoleOption {
  id: UserRole;
  title: UserRole;
  description: string;
  color: string;
  icon: string;
}

export default function ShareProjectDialog({
  project,
  isOpen,
  onClose,
}: ShareProjectDialogProps) {
  // Add console log for debugging
  console.log("ShareProjectDialog rendered with isOpen:", isOpen);
  // Mock data for current users with access
  const [usersWithAccess, setUsersWithAccess] = useState<UserWithAccess[]>([
    {
      id: "user-1",
      name: "Abdullah Maqsood",
      email: "info@amgraphicss.co.uk",
      role: "Admin" as UserRole,
    },
    {
      id: "user-2",
      name: "John Doe",
      email: "john@example.com",
      role: "Viewer" as UserRole,
    }
  ]);

  // Mock data for all available users in the system
  const availableUsers: User[] = [
    {
      id: "user-1",
      name: "Abdullah Maqsood",
      email: "info@amgraphicss.co.uk",
    },
    {
      id: "user-2",
      name: "John Doe",
      email: "john@example.com",
    },
    {
      id: "user-3",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    {
      id: "user-4",
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    {
      id: "user-5",
      name: "Emily Davis",
      email: "emily@example.com",
    }
  ];

  const [searchValue, setSearchValue] = useState("");
  const [showAccessOptions, setShowAccessOptions] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<AccessType>("clients");
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  // Filter out users who already have access
  const filteredUsers = availableUsers.filter(
    user => !usersWithAccess.some(u => u.id === user.id)
  );

  const accessOptions: AccessOption[] = [
    {
      id: "private",
      title: "Private",
      description: "Only invite members",
      icon: <Lock className="h-4 w-4 text-primary" />,
    },
    {
      id: "clients",
      title: "Shared with Clients",
      description: "Only invited clients and members",
      icon: <Share className="h-4 w-4 text-primary" />,
    },
    {
      id: "internal",
      title: "Internal Team",
      description: "Share with everyone in the team",
      icon: <Building2 className="h-4 w-4 text-primary" />,
    }
  ];

  const roleOptions: RoleOption[] = [
    {
      id: "Viewer",
      title: "Viewer",
      description: "Can view and download files",
      color: "bg-primary/10 text-primary",
      icon: ""
    },
    {
      id: "Commenter",
      title: "Commenter",
      description: "Can comment and suggest changes",
      color: "bg-green-100 text-green-700",
      icon: ""
    },
    {
      id: "Manager",
      title: "Manager",
      description: "Can invite users and manage access",
      color: "bg-amber-100 text-amber-700",
      icon: ""
    },
    {
      id: "Admin",
      title: "Admin",
      description: "Full access to all features",
      color: "bg-purple-100 text-purple-700",
      icon: ""
    },
  ];

  const currentAccessOption = accessOptions.find(opt => opt.id === selectedAccess);

  const handleChangeUserRole = (userId: string, newRole: UserRole) => {
    setUsersWithAccess(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    toast({
      title: "Role updated",
      description: `User role has been updated to ${newRole}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {showAccessOptions ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowAccessOptions(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold">Project Access</h3>
            </div>
            <div className="p-2">
              {accessOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${selectedAccess === option.id ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                  onClick={() => {
                    setSelectedAccess(option.id);
                    setShowAccessOptions(false);
                  }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{option.title}</p>
                      {selectedAccess === option.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-xl font-semibold">Share Project</DialogTitle>
              </div>

              <div
                className="flex items-center justify-between border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-primary/5 transition-colors mb-6"
                onClick={() => setShowAccessOptions(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary">
                    {currentAccessOption?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currentAccessOption?.title}</p>
                    <p className="text-xs text-gray-500">{currentAccessOption?.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-primary" />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add people, groups, or emails..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500">
                          Can edit <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="end">
                        <div className="p-1">
                          {roleOptions.map((role) => (
                            <div key={role.id} className="px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer">
                              {role.title}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Invite</Button>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 min-h-[200px]">
              <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">People with access</p>
              <div className="space-y-4">
                {usersWithAccess.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-normal gap-1 text-gray-500">
                          {user.role} <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        {roleOptions.map((role) => (
                          <DropdownMenuItem
                            key={role.id}
                            className="flex items-start gap-2 py-2 cursor-pointer hover:bg-primary/5"
                            onClick={() => handleChangeUserRole(user.id, role.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{role.title}</span>
                              <span className="text-xs text-gray-500">{role.description}</span>
                            </div>
                            {user.role === role.id && <Check className="h-4 w-4 text-primary ml-auto" />}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 mt-2 border-t pt-2">
                          Remove access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Custom Share icon component
function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}