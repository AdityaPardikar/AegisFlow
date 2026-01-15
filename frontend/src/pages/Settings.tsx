import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { User as UserIcon, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        const user = response.data;
        
        // Parse Name for UI
        const parts = (user.full_name || '').split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        
        setFormData({
            firstName,
            lastName,
            email: user.email || ''
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        await api.put('/users/me', {
            full_name: fullName,
            email: formData.email
        });
        toast.success("Profile updated successfully");
    } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
      );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    className="bg-background/50 border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                     name="lastName" 
                     value={formData.lastName}
                     onChange={handleChange} 
                     className="bg-background/50 border-border" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background/50 border-border" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High-risk alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified for transactions with risk score &gt; 80</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Model drift alerts</p>
                  <p className="text-sm text-muted-foreground">Alert when model performance degrades</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Receive daily summary via email</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Risk Thresholds</CardTitle>
              </div>
              <CardDescription>Configure automatic blocking thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-block threshold</Label>
                  <span className="text-sm font-mono text-risk-fraud">85%</span>
                </div>
                <Slider defaultValue={[85]} max={100} step={5} className="w-full" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Review threshold</Label>
                  <span className="text-sm font-mono text-risk-warning">60%</span>
                </div>
                <Slider defaultValue={[60]} max={100} step={5} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
            >
                {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
