"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

interface TestDetailsModalProps {
  appId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export function TestDetailsModal({
  appId,
  open,
  onOpenChange,
  onSubmitted,
}: TestDetailsModalProps) {
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate file types (only images)
      const validFiles = newFiles.filter((file) =>
        file.type.startsWith("image/")
      );

      if (validFiles.length !== newFiles.length) {
        toast.error("Only image files are allowed");
      }

      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!review.trim()) {
      toast.error("Please provide a review");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please select at least one screenshot");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append("appId", appId);
      formData.append("review", review);

      // Append each file to the FormData
      uploadedFiles.forEach((file) => {
        formData.append(`screenshots`, file);
      });

      const response = await fetch("/api/admin/update-app-test-details", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update app test details");
      }

      toast.success("Test details updated successfully");
      onSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating test details:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update test details"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Test Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="review">App Review</Label>
            <Textarea
              id="review"
              placeholder="Enter your detailed review of the app..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Screenshots</Label>
            <div className="border border-input rounded-md p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-md overflow-hidden h-20 w-20"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <div className="flex items-center justify-center h-20 w-full border border-dashed rounded-md text-muted-foreground">
                    <ImageIcon className="h-6 w-6 mr-2" />
                    <span>No screenshots selected</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isSubmitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Screenshots
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Test Details"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
