import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import './emoji-picker.css';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <div className="absolute right-2 top-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setOpen(true)}
      >
        <Smile className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 w-[260px] max-w-[90vw]">
          <div className="emoji-picker-container">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="bottom"
              searchPosition="sticky"
              navPosition="top"
              perLine={7}
              emojiSize={24}
              emojiButtonSize={32}
              maxFrequentRows={0}
              categories={["frequent", "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"]}
              set="native"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 