import React from 'react';
import Label from './Label';
import Checkbox from './Checkbox';
import Button from './Button';
import { queryClient } from '../App';

const AutoReloadSettings = ({ autoReloadEnabled, setAutoReloadEnabled, refreshInterval, setRefreshInterval }) => {
    return (
  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
    <div className="flex items-center justify-between mb-2">
      <Label className="text-sm font-medium">Auto-reload Settings</Label>
      <div className="flex items-center gap-2">
        <Checkbox
          id="auto-reload"
          checked={autoReloadEnabled}
          onCheckedChange={setAutoReloadEnabled}
        />
        <Label htmlFor="auto-reload" className="text-sm">Enable auto-reload</Label>
      </div>
    </div>
    {autoReloadEnabled && (
      <div className="flex items-center gap-2">
        <Label className="text-xs">Refresh every:</Label>
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-600"
        >
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries();
            console.log('Manual refresh triggered');
          }}
        >
          Refresh Now
        </Button>
      </div>
    )}
  </div>
);
};

export default AutoReloadSettings;
