import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Home, Sun, Moon, User, Users, Shield, MoreHorizontal, Pencil, Trash2, UserPlus, Mail, Check } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { dummyProjects, dummyOrganizations } from '@/utils/dummyData';
import { ProjectType, OrganizationType } from '@/types/index';
import { useTheme } from "@/lib/ThemeContext";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserSettings {
  fullName: string;
  password: string;
  theme: 'light' | 'dark';
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedDate: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedDate: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdDate: string;
  members: TeamMember[];
}

interface InviteMember {
  email: string;
  role: string;
  message?: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [activeTeamTab, setActiveTeamTab] = useState("members");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationType[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationType | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Add state for users
  const [users, setUsers] = useState<User[]>([
    { id: "user-1", name: "Mavis Barry", email: "abdullah.maqsood1100@gmail.com", role: "Owner", joinedDate: "5-may-2025" },
    { id: "user-2", name: "Justin", email: "justin@email.com", role: "Designer", joinedDate: "5-may-2025" },
    { id: "user-3", name: "Sarah Wilson", email: "sarah@email.com", role: "Member", joinedDate: "6-may-2025" },
    { id: "user-4", name: "Michael Chen", email: "michael@email.com", role: "Developer", joinedDate: "6-may-2025" }
  ]);
  
  // Add state for user management dialogs
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Add state for role editing
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([
    { id: "admin", name: "Admin", description: "Full Access", memberCount: 1, createdDate: "5-may-2025" },
    { id: "member", name: "Member", description: "Limited Access", memberCount: 2, createdDate: "5-may-2025" },
    { id: "owner", name: "Owner", description: "Full Access", memberCount: 1, createdDate: "5-may-2025" }
  ]);
  
  // Add state for team management
  const [teams, setTeams] = useState<Team[]>([
    { 
      id: "team-1", 
      name: "Design Team", 
      description: "UI/UX Design Team", 
      memberCount: 3, 
      createdDate: "5-may-2025",
      members: [
        { id: "user-1", name: "Mavis Barry", email: "abdullah.maqsood1100@gmail.com", role: "Team Lead", joinedDate: "5-may-2025" },
        { id: "user-2", name: "Justin", email: "justin@email.com", role: "Designer", joinedDate: "5-may-2025" },
        { id: "user-3", name: "Sarah Wilson", email: "sarah@email.com", role: "UI Designer", joinedDate: "6-may-2025" }
      ]
    },
    { 
      id: "team-2", 
      name: "Development Team", 
      description: "Frontend & Backend Development", 
      memberCount: 2, 
      createdDate: "6-may-2025",
      members: [
        { id: "user-1", name: "Mavis Barry", email: "abdullah.maqsood1100@gmail.com", role: "Developer", joinedDate: "5-may-2025" },
        { id: "user-4", name: "Michael Chen", email: "michael@email.com", role: "Lead Developer", joinedDate: "6-may-2025" }
      ]
    }
  ]);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [newTeamMemberDialogOpen, setNewTeamMemberDialogOpen] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<string | null>(null);
  
  // Store current settings and pending changes
  const [currentSettings, setCurrentSettings] = useState<UserSettings>({
    fullName: "Abdullah Maqsood",
    password: "",
    theme: theme as 'light' | 'dark',
  });
  
  const [pendingSettings, setPendingSettings] = useState<UserSettings>({
    fullName: "Abdullah Maqsood",
    password: "",
    theme: theme as 'light' | 'dark',
  });

  // Add state for invite member dialog
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState<InviteMember>({
    email: '',
    role: 'Member',
    message: ''
  });
  const [invitationSent, setInvitationSent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Add state for dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Initialize organizations and projects
  useEffect(() => {
    try {
      // For testing purposes, initialize with dummy data
      if (dummyOrganizations && dummyOrganizations.length > 0) {
        setOrganizations(dummyOrganizations);
        
        // Set the default organization as current
        const defaultOrg = dummyOrganizations.find(org => org.isDefault) || dummyOrganizations[0];
        setCurrentOrganization(defaultOrg);
        
        // Filter projects for the default organization
        if (dummyProjects && dummyProjects.length > 0) {
          const orgProjects = dummyProjects.filter(
            p => !p.organizationId || p.organizationId === defaultOrg.id
          );
          setProjects(orgProjects);
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, []);

  // Update current settings when theme changes externally
  useEffect(() => {
    setCurrentSettings(prev => ({
      ...prev,
      theme: theme as 'light' | 'dark'
    }));
    setPendingSettings(prev => ({
      ...prev,
      theme: theme as 'light' | 'dark'
    }));
  }, [theme]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      pendingSettings.fullName !== currentSettings.fullName ||
      pendingSettings.password !== currentSettings.password ||
      pendingSettings.theme !== currentSettings.theme;
    
    setHasUnsavedChanges(hasChanges);
  }, [pendingSettings, currentSettings]);

  // Warn before window/tab close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPendingSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeSelection = (selectedTheme: 'light' | 'dark') => {
    setPendingSettings(prev => ({
      ...prev,
      theme: selectedTheme
    }));
  };

  const saveChanges = () => {
    // Apply all pending changes
    setCurrentSettings(pendingSettings);
    
    // Apply theme change
    if (currentSettings.theme !== pendingSettings.theme) {
      setTheme(pendingSettings.theme);
    }
    
    // Here you would typically send these changes to your backend
    
    // Show success toast
    toast({
      title: "Settings saved",
      description: "Your changes have been successfully saved.",
    });

    // Clear unsaved changes flag
    setHasUnsavedChanges(false);

    // If there was a pending navigation, execute it now
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      // Store the intended navigation path
      setPendingNavigation(path);
      // Show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      // No unsaved changes, navigate directly
      navigate(path);
    }
  };

  const navigateToHome = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/');
      setShowConfirmDialog(true);
    } else {
      navigate('/');
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };

  const handleEditRole = (role: Role, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentRole(JSON.parse(JSON.stringify(role)));
    setEditRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentRole(JSON.parse(JSON.stringify(role)));
    setDeleteRoleDialogOpen(true);
  };

  const handleSaveRoleEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentRole) return;
    
    // Update the role in the roles array
    setRoles(prev => prev.map(role => 
      role.id === currentRole.id ? currentRole : role
    ));
    
    // Here you would typically update the role in your backend
    toast({
      title: "Role updated",
      description: `${currentRole.name} role has been updated successfully.`,
    });
    
    // Close the dialog and reset the current role
    setEditRoleDialogOpen(false);
    setCurrentRole(null);
  };

  const handleConfirmDeleteRole = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentRole) return;
    
    // Remove the role from the roles array
    setRoles(prev => prev.filter(role => role.id !== currentRole.id));
    
    // Here you would typically delete the role from your backend
    toast({
      title: "Role deleted",
      description: `${currentRole.name} role has been deleted successfully.`,
    });
    
    // Close the dialog and reset the current role
    setDeleteRoleDialogOpen(false);
    setCurrentRole(null);
  };

  const handleEditTeam = (team: Team, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentTeam(JSON.parse(JSON.stringify(team)));
    setEditTeamDialogOpen(true);
  };

  const handleDeleteTeam = (team: Team, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentTeam(JSON.parse(JSON.stringify(team)));
    setDeleteTeamDialogOpen(true);
  };

  const handleSaveTeamEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentTeam) return;
    
    // Update the team in the teams array
    setTeams(prev => prev.map(team => 
      team.id === currentTeam.id ? currentTeam : team
    ));
    
    toast({
      title: "Team updated",
      description: `${currentTeam.name} team has been updated successfully.`,
    });
    
    // Close the dialog and reset the current team
    setEditTeamDialogOpen(false);
    setCurrentTeam(null);
  };

  const handleConfirmDeleteTeam = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentTeam) return;
    
    // Remove the team from the teams array
    setTeams(prev => prev.filter(team => team.id !== currentTeam.id));
    
    toast({
      title: "Team deleted",
      description: `${currentTeam.name} team has been deleted successfully.`,
    });
    
    // Close the dialog and reset the current team
    setDeleteTeamDialogOpen(false);
    setCurrentTeam(null);
  };

  const handleCreateTeam = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentTeam) return;
    
    const newTeam: Team = {
      ...currentTeam,
      id: `team-${teams.length + 1}`,
      memberCount: 0,
      createdDate: new Date().toLocaleDateString(),
      members: []
    };
    
    setTeams(prev => [...prev, newTeam]);
    
    toast({
      title: "Team created",
      description: `${newTeam.name} team has been created successfully.`,
    });
    
    // Close the dialog and reset the current team
    setCreateTeamDialogOpen(false);
    setCurrentTeam(null);
  };

  const handleAddMemberToTeam = (teamId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedTeamForMember(teamId);
    setNewTeamMemberDialogOpen(true);
  };

  const handleSaveNewMember = (member: TeamMember) => {
    if (!selectedTeamForMember) return;
    
    setTeams(prev => prev.map(team => {
      if (team.id === selectedTeamForMember) {
        return {
          ...team,
          members: [...team.members, member],
          memberCount: team.memberCount + 1
        };
      }
      return team;
    }));
    
    toast({
      title: "Member added",
      description: `${member.name} has been added to the team successfully.`,
    });
    
    // Close the dialog and reset the selected team
    setNewTeamMemberDialogOpen(false);
    setSelectedTeamForMember(null);
  };

  const handleInviteMemberChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendInvitation = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!inviteFormData.email || !inviteFormData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsInviting(true);
    
    // Simulate API call to send invitation
    setTimeout(() => {
      // In a real app, you would make an API call to send the invitation
      
      // Add the invited user to the members list with "Pending" status
      // This would typically be handled by your backend
      
      setIsInviting(false);
      setInvitationSent(true);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteFormData.email}.`,
      });
      
      // Reset form after 2 seconds and close dialog
      setTimeout(() => {
        setInviteFormData({
          email: '',
          role: 'Member',
          message: ''
        });
        setInvitationSent(false);
        setInviteMemberDialogOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleCreateRole = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentRole({
      id: `role-${Date.now()}`,
      name: '',
      description: '',
      memberCount: 0,
      createdDate: new Date().toLocaleDateString()
    });
    setEditRoleDialogOpen(true);
  };

  const handleEditUser = (user: User, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentUser(JSON.parse(JSON.stringify(user)));
    setEditUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentUser(JSON.parse(JSON.stringify(user)));
    setDeleteUserDialogOpen(true);
  };

  const handleSaveUserEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentUser) return;
    
    // Update the user in the users array
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id ? currentUser : user
    ));
    
    // Here you would typically update the user in your backend
    toast({
      title: "User updated",
      description: `${currentUser.name}'s information has been updated successfully.`,
    });
    
    // Close the dialog and reset the current user
    setEditUserDialogOpen(false);
    setCurrentUser(null);
  };

  const handleConfirmDeleteUser = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentUser) return;
    
    // Remove the user from the users array
    setUsers(prev => prev.filter(user => user.id !== currentUser.id));
    
    // Here you would typically delete the user from your backend
    toast({
      title: "User removed",
      description: `${currentUser.name} has been removed from the workspace.`,
    });
    
    // Close the dialog and reset the current user
    setDeleteUserDialogOpen(false);
    setCurrentUser(null);
  };

  // Add a function to handle project selection
  const handleProjectSelect = (project: ProjectType) => {
    if (hasUnsavedChanges) {
      // Store the intended navigation path with project information
      setPendingNavigation(`/project/${project.id}`);
      // Show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      // No unsaved changes, navigate directly
      navigate(`/project/${project.id}`);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        projects={projects}
        onCreateProject={() => {}}
        onProjectSelect={handleProjectSelect}
        onCreatePage={() => {}}
        onCreateChat={() => {}}
        onRenameProject={() => {}}
        onDuplicateProject={() => {}}
        onDeleteProject={() => {}}
        currentOrganization={currentOrganization || undefined}
        organizations={organizations}
        onOrganizationChange={() => {}}
        onCreateOrganization={() => {}}
        onUpdateOrganization={() => {}}
        onDeleteOrganization={() => {}}
        isAdmin={true}
        onNavigateHome={navigateToHome}
      />
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <Header title="Settings" />

        {/* Navigation breadcrumb */}
        <div className="px-6 py-2 border-b flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2"
            onClick={() => handleNavigation("/")}
          >
            <Home className="h-4 w-4" />
          </Button>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Settings</span>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">
            {activeTab === "general" ? "General" : 
             activeTab === "members" ? "Members" : 
             activeTab === "teams" ? "Teams" : "Roles & Permission"}
          </span>
        </div>

        <div className="flex flex-1">
          {/* Left sidebar */}
          <div className="w-[240px] border-r bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-xl font-semibold p-4 pb-2">Settings</h2>
            
            <div className="flex flex-col">
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-none text-left px-4 py-2 h-10 ${activeTab === "general" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                <User className="h-4 w-4 mr-2" />
                General
              </Button>
              
              {/* Team & Roles Section Heading */}
              <div className="mt-4 px-4 py-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team & roles</h3>
              </div>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-none text-left px-4 py-2 h-10 ${activeTab === "members" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium" : ""}`}
                onClick={() => {
                  setActiveTab("members");
                  setActiveTeamTab("members");
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-none text-left px-4 py-2 h-10 ${activeTab === "teams" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium" : ""}`}
                onClick={() => {
                  setActiveTab("teams");
                  setActiveTeamTab("teams");
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Teams
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-none text-left px-4 py-2 h-10 ${activeTab === "roles" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium" : ""}`}
                onClick={() => {
                  setActiveTab("roles");
                  setActiveTeamTab("roles");
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Roles & Permission
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "general" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-6">Profile</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Avatar</label>
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>User</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input 
                        name="fullName"
                        value={pendingSettings.fullName} 
                        onChange={handleInputChange}
                        className="max-w-md" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input defaultValue="abdullah.maqsood1100@gmail.com" className="max-w-md" readOnly />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Password</label>
                      <Input 
                        name="password"
                        type="password" 
                        placeholder="Enter New Password" 
                        value={pendingSettings.password}
                        onChange={handleInputChange}
                        className="max-w-md" 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-6">Appearance</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Theme</label>
                      <div className="flex gap-3">
                        <Card 
                          className={`w-[140px] cursor-pointer transition-all ${pendingSettings.theme === "light" ? "ring-2 ring-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                          onClick={() => handleThemeSelection("light")}
                        >
                          <CardContent className="p-3 flex flex-col items-center">
                            <div className="h-24 w-full bg-white border rounded-md mb-3 flex items-center justify-center">
                              <Sun className="h-8 w-8 text-yellow-500" />
                            </div>
                            <span className="font-medium">Light Mode</span>
                          </CardContent>
                        </Card>

                        <Card 
                          className={`w-[140px] cursor-pointer transition-all ${pendingSettings.theme === "dark" ? "ring-2 ring-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                          onClick={() => handleThemeSelection("dark")}
                        >
                          <CardContent className="p-3 flex flex-col items-center">
                            <div className="h-24 w-full bg-gray-900 border rounded-md mb-3 flex items-center justify-center">
                              <Moon className="h-8 w-8 text-gray-300" />
                            </div>
                            <span className="font-medium">Dark Mode</span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Members</h3>
                  <p className="text-sm text-muted-foreground">Manage members, or invite new users</p>
                </div>
                
                <div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setInviteMemberDialogOpen(true)}
                  >
                    <span className="mr-1">+</span> Invite Member
                  </Button>
                </div>
                
                <div className="bg-muted/50 dark:bg-muted/20 rounded-md overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr,120px,100px] px-4 py-3 bg-muted dark:bg-muted/40 text-sm font-medium">
                    <div>Name</div>
                    <div>Joined</div>
                    <div className="text-right">Actions</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-border">
                    {users.map(user => (
                      <div key={user.id} className="grid grid-cols-[1fr,120px,100px] px-4 py-3 items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{user.joinedDate}</div>
                        <div className="flex justify-end">
                          <DropdownMenu open={dropdownOpen === `user-${user.id}`} onOpenChange={(open) => setDropdownOpen(open ? `user-${user.id}` : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  handleEditUser(user, e);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {user.role !== "Owner" && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    handleDeleteUser(user, e);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "teams" && (
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Teams</h3>
                  <p className="text-sm text-muted-foreground">Create and manage teams to organize your workspace members</p>
                </div>
                
                <div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setCurrentTeam({
                        id: '',
                        name: '',
                        description: '',
                        memberCount: 0,
                        createdDate: '',
                        members: []
                      });
                      setCreateTeamDialogOpen(true);
                    }}
                  >
                    <span className="mr-1">+</span> Create Team
                  </Button>
                </div>
                
                {teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.map(team => (
                      <Card key={team.id} className="overflow-hidden">
                        <div className="p-4 flex justify-between items-start border-b">
                          <div>
                            <h4 className="text-lg font-medium">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <span>{team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}</span>
                              <span className="mx-2">•</span>
                              <span>Created on {team.createdDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => handleAddMemberToTeam(team.id, e)}
                            >
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Add Member
                            </Button>
                            <DropdownMenu open={dropdownOpen === `team-${team.id}`} onOpenChange={(open) => setDropdownOpen(open ? `team-${team.id}` : null)}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    handleEditTeam(team, e);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit Team
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    handleDeleteTeam(team, e);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {/* Team Members List */}
                        <div className="divide-y divide-border">
                          {team.members.map(member => (
                            <div key={`${team.id}-${member.id}`} className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                                  {member.role}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Joined {member.joinedDate}</span>
                                <DropdownMenu open={dropdownOpen === `member-${team.id}-${member.id}`} onOpenChange={(open) => setDropdownOpen(open ? `member-${team.id}-${member.id}` : null)}>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        // Handle edit member action
                                        setDropdownOpen(null);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Edit Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        // Handle remove member action
                                        setDropdownOpen(null);
                                      }}
                                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Remove Member
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">No teams created yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">Create your first team to organize your workspace members</p>
                    <Button 
                      onClick={() => {
                        setCurrentTeam({
                          id: '',
                          name: '',
                          description: '',
                          memberCount: 0,
                          createdDate: '',
                          members: []
                        });
                        setCreateTeamDialogOpen(true);
                      }}
                    >
                      <span className="mr-1">+</span> Create Team
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "roles" && (
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Roles & Permissions</h3>
                  <p className="text-sm text-muted-foreground">Create custom roles to control what each member can access and manage in your workspace.</p>
                </div>
                
                <div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={(e) => handleCreateRole(e)}
                  >
                    <span className="mr-1">+</span> Create Role
                  </Button>
                </div>
                
                <div className="bg-muted/50 dark:bg-muted/20 rounded-md overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr,100px,100px,80px] px-4 py-3 bg-muted dark:bg-muted/40 text-sm font-medium">
                    <div>Name</div>
                    <div>Members</div>
                    <div>Created</div>
                    <div className="text-right">Actions</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-border">
                    {roles.map(role => (
                      <div key={role.id} className="grid grid-cols-[1fr,100px,100px,80px] px-4 py-3 items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-muted dark:bg-muted/70 rounded-full flex items-center justify-center text-sm font-medium">
                            {role.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{role.name}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        <div className="text-sm">{role.memberCount} {role.memberCount === 1 ? "Member" : "Members"}</div>
                        <div className="text-sm text-muted-foreground">{role.createdDate}</div>
                        <div className="flex justify-end">
                          <DropdownMenu open={dropdownOpen === role.id} onOpenChange={(open) => setDropdownOpen(open ? role.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  handleEditRole(role, e);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  handleDeleteRole(role, e);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with save button */}
        <div className="border-t py-3 px-4 flex justify-end mt-auto">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </main>

      {/* Unsaved Changes Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialogOpen} onOpenChange={(open) => {
        setEditRoleDialogOpen(open);
        if (!open) setCurrentRole(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Make changes to the role. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-name" className="text-right">
                Name
              </Label>
              <Input
                id="role-name"
                value={currentRole?.name || ""}
                onChange={(e) => setCurrentRole(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-description" className="text-right">
                Description
              </Label>
              <Input
                id="role-description"
                value={currentRole?.description || ""}
                onChange={(e) => setCurrentRole(prev => prev ? {...prev, description: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditRoleDialogOpen(false);
              setCurrentRole(null);
            }}>Cancel</Button>
            <Button onClick={(e) => handleSaveRoleEdit(e)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={deleteRoleDialogOpen} onOpenChange={(open) => {
        setDeleteRoleDialogOpen(open);
        if (!open) setCurrentRole(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {currentRole?.name} role and remove it from all members.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteRoleDialogOpen(false);
              setCurrentRole(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => handleConfirmDeleteRole(e)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Team Dialog */}
      <Dialog open={createTeamDialogOpen} onOpenChange={(open) => {
        setCreateTeamDialogOpen(open);
        if (!open) setCurrentTeam(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize your workspace members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-name" className="text-right">
                Name
              </Label>
              <Input
                id="team-name"
                value={currentTeam?.name || ""}
                onChange={(e) => setCurrentTeam(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
                placeholder="e.g. Design Team"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-description" className="text-right">
                Description
              </Label>
              <Input
                id="team-description"
                value={currentTeam?.description || ""}
                onChange={(e) => setCurrentTeam(prev => prev ? {...prev, description: e.target.value} : null)}
                className="col-span-3"
                placeholder="e.g. Team responsible for UI/UX design"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCreateTeamDialogOpen(false);
              setCurrentTeam(null);
            }}>Cancel</Button>
            <Button onClick={(e) => handleCreateTeam(e)}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editTeamDialogOpen} onOpenChange={(open) => {
        setEditTeamDialogOpen(open);
        if (!open) setCurrentTeam(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Make changes to the team details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-team-name"
                value={currentTeam?.name || ""}
                onChange={(e) => setCurrentTeam(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-team-description"
                value={currentTeam?.description || ""}
                onChange={(e) => setCurrentTeam(prev => prev ? {...prev, description: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditTeamDialogOpen(false);
              setCurrentTeam(null);
            }}>Cancel</Button>
            <Button onClick={(e) => handleSaveTeamEdit(e)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <AlertDialog open={deleteTeamDialogOpen} onOpenChange={(open) => {
        setDeleteTeamDialogOpen(open);
        if (!open) setCurrentTeam(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {currentTeam?.name} team and remove all member associations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteTeamDialogOpen(false);
              setCurrentTeam(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => handleConfirmDeleteTeam(e)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Team Member Dialog */}
      <Dialog open={newTeamMemberDialogOpen} onOpenChange={(open) => {
        setNewTeamMemberDialogOpen(open);
        if (!open) setSelectedTeamForMember(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add an existing user or invite a new user to the team.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Users</TabsTrigger>
              <TabsTrigger value="new">New User</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr,100px] px-4 py-3 bg-muted dark:bg-muted/40 text-sm font-medium rounded-md">
                  <div>Name</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-border">
                  {/* Sample Existing Users - In a real app, fetch from your user database */}
                  <div className="grid grid-cols-[1fr,100px] px-4 py-3 items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Justin</p>
                        <p className="text-xs text-muted-foreground">justin@email.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          handleSaveNewMember({
                            id: "user-2",
                            name: "Justin",
                            email: "justin@email.com",
                            role: "Member",
                            joinedDate: new Date().toLocaleDateString()
                          });
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr,100px] px-4 py-3 items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>SW</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Sarah Wilson</p>
                        <p className="text-xs text-muted-foreground">sarah@email.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button 
                        size="sm"
                        onClick={() => {
                          handleSaveNewMember({
                            id: "user-3",
                            name: "Sarah Wilson",
                            email: "sarah@email.com",
                            role: "Member",
                            joinedDate: new Date().toLocaleDateString()
                          });
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="new-name"
                      placeholder="Full Name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="email@example.com"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-role" className="text-right">
                      Role
                    </Label>
                    <Input
                      id="new-role"
                      placeholder="e.g. Designer, Developer"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      // In a real app, you would validate and get values from form inputs
                      const newMember: TeamMember = {
                        id: `user-${Date.now()}`,
                        name: "New User", // Replace with actual form value
                        email: "newuser@example.com", // Replace with actual form value
                        role: "Member", // Replace with actual form value
                        joinedDate: new Date().toLocaleDateString()
                      };
                      handleSaveNewMember(newMember);
                    }}
                  >
                    Invite & Add to Team
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberDialogOpen} onOpenChange={(open) => {
        setInviteMemberDialogOpen(open);
        if (!open && !isInviting) {
          setInviteFormData({
            email: '',
            role: 'Member',
            message: ''
          });
          setInvitationSent(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization.
            </DialogDescription>
          </DialogHeader>
          
          {invitationSent ? (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Invitation Sent!</h3>
              <p className="text-sm text-muted-foreground">
                We've sent an invitation to {inviteFormData.email}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInvitation} className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="invite-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteFormData.email}
                    onChange={handleInviteMemberChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="invite-role" className="text-right">
                    Role
                  </Label>
                  <select
                    id="invite-role"
                    name="role"
                    value={inviteFormData.role}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Designer">Designer</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="invite-message" className="text-right pt-2">
                    Message
                  </Label>
                  <textarea
                    id="invite-message"
                    name="message"
                    placeholder="Optional message to include in the invitation"
                    value={inviteFormData.message}
                    onChange={handleInviteMemberChange}
                    className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setInviteMemberDialogOpen(false);
                    setInviteFormData({
                      email: '',
                      role: 'Member',
                      message: ''
                    });
                    setInvitationSent(false);
                  }}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isInviting}
                  className="flex items-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={(open) => {
        setEditUserDialogOpen(open);
        if (!open) setCurrentUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {currentUser?.name}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser?.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user-role" className="text-right">
                Role
              </Label>
              <select
                id="user-role"
                value={currentUser?.role || ""}
                onChange={(e) => setCurrentUser(prev => prev ? {...prev, role: e.target.value} : null)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditUserDialogOpen(false);
              setCurrentUser(null);
            }}>Cancel</Button>
            <Button onClick={(e) => handleSaveUserEdit(e)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={(open) => {
        setDeleteUserDialogOpen(open);
        if (!open) setCurrentUser(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {currentUser?.name} from the workspace?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteUserDialogOpen(false);
              setCurrentUser(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => handleConfirmDeleteUser(e)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings; 