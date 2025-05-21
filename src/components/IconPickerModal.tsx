import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { IconPicker } from './IconPicker';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export default function IconPickerModal({
  isOpen,
  onClose,
  onSelect
}: IconPickerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="emoji" className="flex-1">Emoji</TabsTrigger>
            <TabsTrigger value="icons" className="flex-1">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="emoji" className="mt-4">
            <Picker 
              data={data} 
              onEmojiSelect={(emoji: any) => {
                onSelect(emoji.native);
                onClose();
              }}
              theme="light"
            />
          </TabsContent>
          <TabsContent value="icons" className="mt-4">
            <IconPicker onSelect={(icon) => {
              onSelect(icon);
              onClose();
            }} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 