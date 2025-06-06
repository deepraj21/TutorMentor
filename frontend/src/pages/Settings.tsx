import { useState } from "react";
import Header from "../components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, SettingsIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [fontPreference, setFontPreference] = useState("inter");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Settings" />
      
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl text-foreground mb-8 flex items-center gap-2"><SettingsIcon /> Settings</h2>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-5 w-5" />
                    <Label htmlFor="theme-toggle">Dark Mode</Label>
                  </div>
                  <Switch 
                    id="theme-toggle" 
                    checked={theme === "dark"} 
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">In-app Notifications</Label>
                  <Switch 
                    id="notifications" 
                    checked={notifications} 
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
