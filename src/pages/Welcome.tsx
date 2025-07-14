import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Welcome = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    // Save name to localStorage
    localStorage.setItem('userName', name.trim());
    localStorage.setItem('completedWelcome', 'true');
    
    toast({
      title: "Welcome!",
      description: `Welcome to Game Price Tracker, ${name}!`,
    });

    // Force a page refresh to trigger the app state change
    window.location.href = '/';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGetStarted();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Gamepad2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to Game Price Tracker
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Track prices, find deals, and build your gaming wishlist
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                What's your name?
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                autoFocus
              />
            </div>

            <Button 
              onClick={handleGetStarted}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Discover the best gaming deals across multiple platforms
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;