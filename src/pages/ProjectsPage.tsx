import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectApi, employeeApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChatBox } from '@/components/chat/ChatBox';
import type { Project, Employee } from '@/types';
import { PlusCircle, Search, Users, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { role, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // New Project Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedPm, setSelectedPm] = useState('');

  // Edit Team Form State
  const [selectedTeamMemberToAdd, setSelectedTeamMemberToAdd] = useState('');

  const canCreateProject = role === 'gm'; // Only GM can creating projects as per requirements

  const loadData = async () => {
    const prjs = await projectApi.getAll();
    // Filter logic client side for MVP since backend returns all
    if (role === 'project_manager') {
      setProjects(prjs.filter(p => p.project_manager_id === user?.employee_id));
    } else if (role === 'employee') {
      setProjects(prjs.filter(p => p.team_members.includes(user?.employee_id || '')));
    } else {
      setProjects(prjs); // Managers and HR see all
    }

    if (canCreateProject || role === 'project_manager') {
      const emps = await employeeApi.getAll();
      setEmployees(emps);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !selectedPm) return;
    
    await projectApi.create({
      name: newProjectName,
      description: newProjectDesc,
      general_manager_id: user?.employee_id,
      project_manager_id: selectedPm
    });
    
    toast.success("Project created successfully");
    setIsDialogOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
    setSelectedPm('');
    loadData();
  };

  const handleAddTeamMember = async () => {
    if (!selectedProject || !selectedTeamMemberToAdd) return;
    if (selectedProject.team_members.includes(selectedTeamMemberToAdd)) {
      toast.error("Employee is already in the team");
      return;
    }
    const newTeam = [...selectedProject.team_members, selectedTeamMemberToAdd];
    const updated = await projectApi.updateTeam(selectedProject.project_id, newTeam);
    setSelectedProject(updated);
    toast.success("Team member added");
    setSelectedTeamMemberToAdd('');
    loadData();
  };

  const getEmpName = (id: string) => {
    const e = employees.find(e => e.employee_id === id);
    return e ? e.name : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Workspace</h1>
          <p className="text-muted-foreground mt-1">Manage projects, teams, and collaborate.</p>
        </div>
        {canCreateProject && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><PlusCircle size={18} /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Assign Project Manager</Label>
                  <Select value={selectedPm} onValueChange={setSelectedPm} required>
                    <SelectTrigger><SelectValue placeholder="Select PM" /></SelectTrigger>
                    <SelectContent>
                      {employees.filter(e => e.role === 'project_manager').map(emp => (
                        <SelectItem key={emp.employee_id} value={emp.employee_id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        {/* Project List */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4 overflow-hidden border rounded-xl bg-card">
          <div className="p-4 border-b bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-9 bg-background" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {projects.map(p => (
              <div 
                key={p.project_id} 
                onClick={() => setSelectedProject(p)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedProject?.project_id === p.project_id ? 'bg-primary/10 border-primary/30 shadow-sm' : 'bg-background hover:bg-muted border-transparent'}`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  {p.name}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-muted'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center p-6 text-muted-foreground text-sm">No projects found.</div>
            )}
          </div>
        </div>

        {/* Project Viewer / Chat */}
        <div className="md:col-span-8 lg:col-span-9">
          {selectedProject ? (
            <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-card px-6 py-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedProject.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <Tabs defaultValue="team-chat" className="flex-1 flex flex-col">
                <div className="px-6 border-b bg-card">
                  <TabsList className="h-12 bg-transparent space-x-2">
                    <TabsTrigger value="team-chat" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-3">
                      <Users className="w-4 h-4 mr-2" /> Team Chat
                    </TabsTrigger>
                    <TabsTrigger value="team-info" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-3">
                      <UserCircle className="w-4 h-4 mr-2" /> Team
                    </TabsTrigger>
                    {/* Management chat is visible to GM and PM only */}
                    {(role === 'gm' || user?.employee_id === selectedProject.project_manager_id) && (
                      <TabsTrigger value="mgmt-chat" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-3">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Management Chat
                      </TabsTrigger>
                    )}
                    {/* Settings visible to PM */}
                    {role === 'project_manager' && user?.employee_id === selectedProject.project_manager_id && (
                      <TabsTrigger value="settings" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-3">
                        <Settings className="w-4 h-4 mr-2" /> Team Settings
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-hidden p-6 bg-muted/10">
                  <TabsContent value="team-chat" className="h-full m-0 data-[state=active]:flex flex-col">
                    <ChatBox projectId={selectedProject.project_id} channel="team" />
                  </TabsContent>

                  <TabsContent value="team-info" className="h-full m-0">
                    <Card className="shadow-sm max-w-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Project Team</CardTitle>
                        <CardDescription>Members assigned to {selectedProject.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">PM</div>
                            <div>
                              <div className="font-semibold text-sm">{getEmpName(selectedProject.project_manager_id)}</div>
                              <div className="text-xs text-muted-foreground italic">Project Manager</div>
                            </div>
                          </div>
                          {selectedProject.team_members.map(empId => (
                            <div key={empId} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                                {getEmpName(empId).charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{getEmpName(empId)}</div>
                                <div className="text-xs text-muted-foreground">Team Member</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedProject.team_members.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground text-sm italic">No team members added yet.</div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="mgmt-chat" className="h-full m-0 data-[state=active]:flex flex-col">
                    <ChatBox projectId={selectedProject.project_id} channel="management" />
                  </TabsContent>

                  <TabsContent value="settings" className="h-full m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Add Team Member</CardTitle>
                          <CardDescription>Select an employee to add to this project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Select value={selectedTeamMemberToAdd} onValueChange={setSelectedTeamMemberToAdd}>
                              <SelectTrigger className="flex-1"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                              <SelectContent>
                                {employees.filter(e => !selectedProject.team_members.includes(e.employee_id) && e.employee_id !== selectedProject.project_manager_id).map(emp => (
                                  <SelectItem key={emp.employee_id} value={emp.employee_id}>{emp.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleAddTeamMember}>Add</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed rounded-xl flex items-center justify-center bg-card text-muted-foreground flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <LayoutDashboard className="w-8 h-8 opacity-50" />
              </div>
              <p>Select a project from the left panel to start collaborating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
