import { Settings as SettingsIcon, Palette, Globe, Bell, User, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const REGIONS = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [userName, setUserName] = useState('');
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    newDeals: false,
    freeGames: true,
    wishlistUpdates: true,
  });

  useEffect(() => {
    // Load user settings from localStorage
    const savedName = localStorage.getItem('userName') || '';
    const savedRegion = localStorage.getItem('selectedRegion') || 'US';
    const savedNotifications = localStorage.getItem('notifications');

    setUserName(savedName);
    setSelectedRegion(savedRegion);
    
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }

    // Store original settings for comparison
    setOriginalSettings({
      theme,
      selectedRegion: savedRegion,
      userName: savedName,
      notifications: savedNotifications ? JSON.parse(savedNotifications) : notifications,
    });
  }, [theme]);

  const hasChanges = () => {
    if (!originalSettings) return false;
    
    return (
      theme !== originalSettings.theme ||
      selectedRegion !== originalSettings.selectedRegion ||
      userName !== originalSettings.userName ||
      JSON.stringify(notifications) !== JSON.stringify(originalSettings.notifications)
    );
  };

  const handleApplyChanges = () => {
    // Save all settings to localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('selectedRegion', selectedRegion);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Update original settings
    setOriginalSettings({
      theme,
      selectedRegion,
      userName,
      notifications: { ...notifications },
    });

    toast({
      title: "Settings applied",
      description: "Your settings have been saved successfully.",
    });
  };

  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'game': return 'Game Mode (Default)';
      default: return theme;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your game tracking experience</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Your Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This name will be displayed throughout the app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose how the application looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'game') => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game">🎮 Game Mode (Default)</SelectItem>
                  <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                  <SelectItem value="light">☀️ Light Mode</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Current: {getThemeDisplayName(theme)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Region & Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Region & Currency
            </CardTitle>
            <CardDescription>
              Set your preferred region for pricing and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name} ({region.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Prices will be displayed in {REGIONS.find(r => r.code === selectedRegion)?.currency}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when wishlist games go on sale
                  </p>
                </div>
                <Switch
                  checked={notifications.priceAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, priceAlerts: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Deals</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly digest of the best new deals
                  </p>
                </div>
                <Switch
                  checked={notifications.newDeals}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, newDeals: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Free Games</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when games become free
                  </p>
                </div>
                <Switch
                  checked={notifications.freeGames}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, freeGames: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wishlist Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Changes to games in your wishlist
                  </p>
                </div>
                <Switch
                  checked={notifications.wishlistUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, wishlistUpdates: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account and data preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Export Wishlist Data
            </Button>
            <Button variant="outline" className="w-full">
              Import Wishlist Data
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* Apply Changes */}
        {hasChanges() && (
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Unsaved Changes</h3>
                  <p className="text-sm text-muted-foreground">
                    You have unsaved changes. Click Apply to save your settings.
                  </p>
                </div>
                <Button onClick={handleApplyChanges} className="bg-primary hover:bg-primary/90">
                  Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About
            </CardTitle>
            <CardDescription>
              Information about Game Price Tracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold">Version</h4>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <h4 className="font-semibold">Data Source</h4>
                <p className="text-sm text-muted-foreground">CheapShark API</p>
              </div>
              <div>
                <h4 className="font-semibold">Last Updated</h4>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;