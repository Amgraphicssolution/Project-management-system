import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cover: { type: 'image' | 'color'; value: string }) => void;
}

export default function CoverPickerModal({
  isOpen,
  onClose,
  onSelect
}: CoverPickerModalProps) {
  const [color, setColor] = useState("#000000");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect({ type: 'image', value: reader.result as string });
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Cover</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload Image</TabsTrigger>
            <TabsTrigger value="color" className="flex-1">Color</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground">
                Recommended size: 1500x500px
              </p>
            </div>
          </TabsContent>
          <TabsContent value="color" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div 
                  className="w-32 h-32 rounded-lg border"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hex Code</label>
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  onSelect({ type: 'color', value: color });
                  onClose();
                }}
              >
                Apply Color
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 