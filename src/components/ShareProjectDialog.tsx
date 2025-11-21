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
      icon: <Lock className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "clients",
      title: "Shared with Clients",
      description: "Only invited clients and members",
      icon: <Share className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "internal",
      title: "Internal",
      description: "Any member invited to your workspace",
      icon: <Building2 className="h-4 w-4 text-blue-500" />,
    },
  ];

  const roleOptions: RoleOption[] = [
    {
      id: "Viewer",
      title: "Viewer",
      description: "Can view and download files",
      color: "bg-blue-100 text-blue-700",
      icon: "👁️"
    },
    {
      id: "Commenter",
      title: "Commenter",
      description: "Can comment and suggest changes",
      color: "bg-green-100 text-green-700",
      icon: "💬"
    },
    {
      id: "Manager",
      title: "Manager",
      description: "Can invite users and manage access",
      color: "bg-amber-100 text-amber-700",
      icon: "👥"
    },
    {
      id: "Admin",
      title: "Admin",
      description: "Full access to all features",
      color: "bg-purple-100 text-purple-700",
      icon: "⭐"
    },
  ];

  const currentAccessOption = accessOptions.find(option => option.id === selectedAccess);

  const handleSelectAccess = (accessType: AccessType) => {
    setSelectedAccess(accessType);
    setShowAccessOptions(false);
  };

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

  const handleAddUser = (user: User) => {
    // Check if user is already added
    if (usersWithAccess.some(u => u.id === user.id)) {
      return;
    }

    // Add user with default Viewer role
    setUsersWithAccess(prev => [
      ...prev,
      {
        ...user,
        role: "Viewer" as UserRole
      }
    ]);

    // Close the popover and reset search
    setUserSearchOpen(false);
    setSearchValue("");

    toast({
      title: "User added",
      description: `${user.name} has been added with Viewer access`,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange called with:", open);
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {showAccessOptions ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 text-blue-500 hover:bg-blue-50"
                onClick={() => setShowAccessOptions(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl text-greyscale-700">Who can access</DialogTitle>
            </div>
          ) : (
            <DialogTitle className="text-xl text-greyscale-700">Share</DialogTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-greyscale-500 hover:text-greyscale-700 hover:bg-blue-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {showAccessOptions ? (
          <div className="flex flex-col gap-3 py-4">
            {accessOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedAccess === option.id ? "border-blue-500 bg-blue-50/50" : "border-gray-200"
                  }`}
                onClick={() => handleSelectAccess(option.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`${selectedAccess === option.id ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-gray-600"
                    } h-8 w-8 rounded-full flex items-center justify-center`}>
                    {option.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{option.title}</p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
                {selectedAccess === option.id && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            {/* User search with dropdown */}
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder="Add members or clients"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      if (e.target.value.length > 0 && !userSearchOpen) {
                        setUserSearchOpen(true);
                      }
                    }}
                    className="border-gray-300 pr-8 focus:border-blue-500 focus:ring-blue-500"
                    onClick={() => {
                      if (filteredUsers.length > 0) {
                        setUserSearchOpen(true);
                      }
                    }}
                  />
                  <UserPlus className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width] border-blue-200" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>No users found</CommandEmpty>
                    <CommandGroup>
                      {filteredUsers
                        .filter(user =>
                          user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchValue.toLowerCase())
                        )
                        .map(user => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => handleAddUser(user)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 bg-blue-100 text-blue-700">
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Users with access section */}
            <div className="space-y-4">
              <h3 className="text-sm text-blue-700 font-medium">Users with Access</h3>

              {usersWithAccess.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-blue-100 text-blue-700">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name} {user.id === "user-1" && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">You</span>}</p>
                      <p className="text-xs text-gray-500">Member - {user.email}</p>
                    </div>
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 flex items-center gap-1 text-sm font-normal border-blue-200 hover:border-blue-500"
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleOptions.find(r => r.id === user.role)?.color
                            }`}>
                            {roleOptions.find(r => r.id === user.role)?.icon} {user.role}
                          </span>
                          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 z-50">
                        {roleOptions.map((role) => (
                          <DropdownMenuItem
                            key={role.id}
                            className="flex items-start gap-2 py-2 cursor-pointer hover:bg-blue-50"
                            onClick={() => {
                              handleChangeUserRole(user.id, role.id);
                            }}
                          >
                            <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs ${role.color}`}>
                              {role.icon}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{role.title}</span>
                              <span className="text-xs text-gray-500">{role.description}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* General access section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm text-gray-500 font-medium">General Access</h3>

              <div
                className="flex items-center justify-between border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => setShowAccessOptions(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-500">
                    {currentAccessOption?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currentAccessOption?.title}</p>
                    <p className="text-xs text-gray-500">{currentAccessOption?.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-500" />
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