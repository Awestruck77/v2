import { AlertTriangle, WifiOff, Zap, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  errorCode: string;
}

const getErrorIcon = (errorCode: string) => {
  if (errorCode.startsWith('NET')) {
    return <WifiOff className="w-6 h-6 text-destructive" />;
  }
  if (errorCode.startsWith('API')) {
    return <Zap className="w-6 h-6 text-warning" />;
  }
  return <AlertTriangle className="w-6 h-6 text-destructive" />;
};

const getErrorDescription = (errorCode: string) => {
  switch (errorCode) {
    case 'NET_001':
      return 'Unable to connect to the internet. Please check your network connection and try again.';
    case 'NET_002':
      return 'Connection timeout. The request took too long to complete.';
    case 'API_001':
      return 'Game price service is temporarily unavailable. Please try again in a few minutes.';
    case 'API_002':
      return 'Rate limit exceeded. Please wait a moment before making another request.';
    case 'API_003':
      return 'Invalid region selected. Please choose a different region.';
    case 'GAME_001':
      return 'Game data could not be loaded. This game might not be available in your region.';
    case 'SEARCH_001':
      return 'Search service is temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
};

const getSuggestions = (errorCode: string) => {
  switch (errorCode) {
    case 'NET_001':
    case 'NET_002':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable any VPN or proxy',
        'Contact your ISP if the problem persists'
      ];
    case 'API_001':
    case 'API_002':
      return [
        'Wait a few minutes and try again',
        'Check our status page for service updates',
        'Try using a different region',
        'Contact support if the issue continues'
      ];
    case 'API_003':
      return [
        'Select a different region from the dropdown',
        'Try using United States as your region',
        'Clear your browser cache and cookies',
        'Contact support if no regions work'
      ];
    default:
      return [
        'Refresh the page and try again',
        'Clear your browser cache',
        'Try using a different browser',
        'Contact support with error code: ' + errorCode
      ];
  }
};

export const ErrorDialog = ({ isOpen, onClose, title, message, errorCode }: ErrorDialogProps) => {
  const suggestions = getSuggestions(errorCode);
  const description = getErrorDescription(errorCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getErrorIcon(errorCode)}
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                Error Code: {errorCode}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              {message}
            </p>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Suggestions to fix this:
            </h4>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              Retry
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};