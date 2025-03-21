"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, File, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Material {
  id: string
  title: string
  type: string
  url: string
  uploadedAt: string
}

interface CourseMaterialsProps {
  courseId: string
}

export function CourseMaterials({ courseId }: CourseMaterialsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mock data - in a real app, this would come from your API
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "1",
      title: "Course Syllabus",
      type: "pdf",
      url: "#",
      uploadedAt: "2023-09-01T12:00:00Z",
    },
    {
      id: "2",
      title: "Week 1 Lecture Slides",
      type: "pptx",
      url: "#",
      uploadedAt: "2023-09-05T14:30:00Z",
    },
    {
      id: "3",
      title: "Required Reading - Chapter 1",
      type: "pdf",
      url: "#",
      uploadedAt: "2023-09-07T09:15:00Z",
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialTitle || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the new material to the list
      const newMaterial: Material = {
        id: Date.now().toString(),
        title: materialTitle,
        type: selectedFile.name.split('.').pop() || "file",
        url: "#", // In a real app, this would be the URL to the uploaded file
        uploadedAt: new Date().toISOString(),
      };
      
      setMaterials([...materials, newMaterial]);
      
      toast({
        title: "File uploaded",
        description: `${materialTitle} has been uploaded successfully.`,
      });
      
      // Reset form
      setMaterialTitle("");
      setSelectedFile(null);
      setShowUploadForm(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove the material from the list
      setMaterials(materials.filter(material => material.id !== id));
      
      toast({
        title: "Material deleted",
        description: "The course material has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the material. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Materials</CardTitle>
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          size="sm"
        >
          {showUploadForm ? "Cancel" : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Add Material
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {showUploadForm && (
          <form onSubmit={handleUpload} className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="space-y-4">
              <div>
                <Label htmlFor="materialTitle">Material Title</Label>
                <Input
                  id="materialTitle"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="Week 2 Lecture Slides"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">Upload File</Label>
                <div className="mt-1 flex items-center">
                  <label className="block w-full">
                    <span className="sr-only">Choose file</span>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                      required
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {materials.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No materials uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {materials.map((material) => (
              <div 
                key={material.id}
                className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <File className="h-5 w-5 mr-3 text-primary-600" />
                  <div>
                    <p className="font-medium">{material.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {formatDate(material.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={material.url} target="_blank" rel="noreferrer no
\"

