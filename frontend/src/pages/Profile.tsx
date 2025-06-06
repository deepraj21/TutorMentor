
import { useState } from "react";
import Header from "../components/layout/Header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { User2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user profile on the backend
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Profile" />
      
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl text-foreground mb-8 flex items-center gap-2"><User2 />Your Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.photoURL} />
                  <AvatarFallback className="text-4xl bg-education-600 text-white">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground capitalize mt-1">{user?.role}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-xs">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                       disabled
                      />
                    </div>
                    
                    <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
