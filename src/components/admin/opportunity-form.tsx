// src/components/admin/opportunity-form.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";
import { OpportunityStatus, Opportunity } from "@prisma/client"; // Import Opportunity type if available
import { opportunitySchema, OpportunityFormData } from "@/lib/schemas/opportunitySchema"; // Import the schema and type
// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { z } from 'zod';
// Icons
import { AlertCircle, Upload, X, Image as ImageIcon, CalendarIcon } from "lucide-react";

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
}

// Consider using a stricter type from Prisma if possible, e.g., Partial<Opportunity>
// This improves type safety compared to 'any'.
type InitialOpportunityData = Partial<Omit<Opportunity, 'createdAt' | 'updatedAt'>> & { id?: string };

// The schema and OpportunityFormData type are now imported from @/lib/schemas/opportunitySchema

interface OpportunityFormProps {
  categories: Category[];
  organizations: Organization[];
  initialData?: InitialOpportunityData | null; // Use the stricter type
  isEdit?: boolean;
}

export default function OpportunityForm({
  categories,
  organizations,
  initialData,
  isEdit = false,
}: OpportunityFormProps) {
  const router = useRouter();
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  // --- Image Upload State ---
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialize react-hook-form ---
  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: initialData?.title ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      description: initialData?.description ?? "",
      eligibility: initialData?.eligibility ?? "",
      applicationProcess: initialData?.applicationProcess ?? "",
      benefits: initialData?.benefits ?? "",
      contactInfo: initialData?.contactInfo ?? "",
      externalLink: initialData?.externalLink ?? "",
      // Ensure dates are Date objects or undefined for RHF/Calendar
      deadline: initialData?.deadline ? new Date(initialData.deadline) : undefined,
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      status: initialData?.status ?? OpportunityStatus.ACTIVE, // Default to ACTIVE for new forms
      categoryId: initialData?.categoryId ?? "",
      organizationId: initialData?.organizationId ?? "",
      isPopular: initialData?.isPopular ?? false,
      imageUrl: initialData?.imageUrl ?? null,
    },
  });

  // Get form state for disabling fields
  const { isSubmitting } = form.formState;
  const isProcessing = isSubmitting || isUploadingImage; // Combine states for disabling

  // Effect to update preview if initialData changes (e.g., after edit load)
  useEffect(() => {
    setImagePreview(initialData?.imageUrl ?? null);
    // Optionally reset the entire form if initialData itself changes reference
    // form.reset({... new default values based on new initialData ...});
  }, [initialData?.imageUrl]); // Depend only on the relevant part

  // --- Image Upload Handlers ---
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please select a JPG, PNG, or WEBP image.");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Image size exceeds the limit of ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    setIsUploadingImage(true);
    setTopLevelError(null); // Clear previous errors
    const originalPreview = imagePreview; // Backup original

    // Optimistic UI: Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      // Use environment variable for API route if needed
      const response = await fetch(`/api/admin/opportunities/image`, {
        method: "POST",
        body: uploadFormData,
        // Add headers if your API requires auth tokens etc.
      });

      if (!response.ok) {
        let errorMsg = "Failed to upload image.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) { /* Ignore JSON parsing error if response is not JSON */ }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.imageUrl || typeof data.imageUrl !== 'string' || !data.imageUrl.startsWith('http')) {
          throw new Error("Invalid image URL received from server.");
      }

      // Update RHF state with the *server-confirmed* URL
      form.setValue("imageUrl", data.imageUrl, { shouldValidate: true, shouldDirty: true });
      // Update preview state to match confirmed URL (might be CDN URL, etc.)
      setImagePreview(data.imageUrl);

      toast.success("Image uploaded successfully.");

    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
      setImagePreview(originalPreview); // Revert preview on failure
      // Optionally revert RHF state too, though usually not needed if form isn't submitted yet
      form.setValue("imageUrl", originalPreview, { shouldValidate: true });
    } finally {
      setIsUploadingImage(false);
      // Clear file input value to allow re-uploading the same file if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    // Update RHF state
    form.setValue("imageUrl", null, { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Image marked for removal. Save the form to confirm.");
  };

  // --- Form Submission Handler ---
  const onSubmit: SubmitHandler<OpportunityFormData> = async (data) => {
    if (isUploadingImage) {
      toast.warning("Please wait for the image upload to complete before saving.");
      return;
    }
    setTopLevelError(null); // Clear previous errors

    // The 'data' object here contains validated data from the form, including the imageUrl
    console.log("Submitting data:", data); // For debugging

    try {
      const endpoint = isEdit
                ? `/api/admin/opportunities/${initialData?.id}` // ADMIN update path
                : '/api/admin/opportunities';                 // ADMIN create path
      const method = isEdit ? 'PUT' : 'POST';

      if (isEdit && !initialData?.id) {
          throw new Error("Cannot update opportunity: Missing ID.");
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Send validated data
      });

      if (!response.ok) {
        let errorMsg = `Failed to ${isEdit ? 'update' : 'create'} opportunity.`;
         try {
          const errorData = await response.json();
          // Look for specific error messages from the API
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) { /* Ignore JSON parsing error */ }
        throw new Error(errorMsg);
      }

      toast.success(`Opportunity ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/opportunities'); // Redirect on success
      router.refresh(); // Refresh server components on the target page

    } catch (err: any) {
      console.error("Submission error:", err);
      setTopLevelError(err.message || "An unexpected error occurred.");
      toast.error(`Error: ${err.message}`);
      // isSubmitting will automatically become false via RHF
    }
    // No need for finally block to set submitting state, RHF handles it
  };

  // --- Helper Function for Status Formatting ---
  const formatStatus = (status: string) => {
    return status
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  return (
    // Ensure Shadcn base styles are correctly set up in your project's CSS
    // Check globals.css and tailwind.config.js
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {topLevelError && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-center text-destructive text-sm border border-destructive/30">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{topLevelError}</p>
          </div>
        )}

        {/* --- Image Upload Section --- */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">Opportunity Image</h2>
            <FormField
                control={form.control}
                name="imageUrl" // Must match schema
                render={({ field }) => ( // field.value contains the URL state managed by RHF
                    <FormItem>
                    <FormLabel>Upload Image (Optional)</FormLabel>
                    <FormControl>
                        {/* UI below is controlled by local state (imagePreview, isUploadingImage) */}
                        {/* but RHF's field.value is updated via form.setValue */}
                        <div className="mt-2 space-y-3">
                            <div className="relative aspect-video w-full max-w-xl border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden bg-muted/50">
                                {imagePreview ? (
                                    <>
                                    {/* Use Next/Image for optimization */}
                                    <Image src={imagePreview} alt="Opportunity Preview" layout="fill" objectFit="cover" className="absolute inset-0" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 z-10 rounded-full h-8 w-8"
                                        onClick={removeImage}
                                        disabled={isProcessing}
                                        title="Remove Image"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/70" />
                                        <p className="mt-2 text-sm">No image selected</p>
                                    </div>
                                )}
                                {isUploadingImage && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                        <Spinner className="h-8 w-8 text-primary" />
                                    </div>
                                )}
                            </div>
                            <Button type="button" variant="outline" onClick={triggerFileUpload} disabled={isProcessing}>
                                <Upload className="mr-2 h-4 w-4" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </div>
                    </FormControl>
                    <FormDescription>Recommended: 16:9 aspect ratio (e.g., 1200x675px). Max 5MB. JPG, PNG, WEBP.</FormDescription>
                    {/* FormMessage will show RHF validation errors for imageUrl (e.g., if URL is invalid) */}
                    <FormMessage />
                    {/* Hidden file input, linked by ref */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isUploadingImage} // Only disable during active upload
                    />
                </FormItem>
            )}
            />
        </div>


        {/* --- Basic Information Section --- */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-card-foreground">Basic Information</h2>

          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="e.g., Summer Tech Internship" {...field} disabled={isProcessing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="shortDescription" render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="Brief summary for card previews (max 200 chars)" {...field} maxLength={200} disabled={isProcessing} /></FormControl>
              <FormDescription>Max 200 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

         <FormField control={form.control} name="categoryId" render={({ field }) => (
            <FormItem>
              <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {categories.length > 0 ? (
                      categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)
                  ) : (
                      <SelectItem value="-" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="organizationId" render={({ field }) => (
            <FormItem>
              <FormLabel>Organization <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                 <FormControl><SelectTrigger><SelectValue placeholder="Select an organization..." /></SelectTrigger></FormControl>
                 <SelectContent>
                  {organizations.length > 0 ? (
                      organizations.map((org) => <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>)
                  ) : (
                     <SelectItem value="-" disabled>No organizations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.values(OpportunityStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                        {formatStatus(status)} {/* Use helper for display */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* --- Detailed Information Section --- */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
           <h2 className="text-lg font-semibold text-card-foreground">Detailed Information</h2>

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                <FormLabel>Full Description <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="Provide a comprehensive description of the opportunity, including goals, activities, expected outcomes, etc." rows={8} {...field} disabled={isProcessing} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="eligibility" render={({ field }) => (
                <FormItem>
                <FormLabel>Eligibility Requirements <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="Specify who can apply (e.g., age range, education level, location, required skills)." rows={4} {...field} disabled={isProcessing} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />

             <FormField control={form.control} name="applicationProcess" render={({ field }) => (
                <FormItem>
                <FormLabel>Application Process <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="Explain the steps to apply (e.g., submit form, send email, required documents)." rows={4} {...field} disabled={isProcessing} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />

             <FormField control={form.control} name="benefits" render={({ field }) => (
                <FormItem>
                <FormLabel>Benefits <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="List the advantages for participants (e.g., stipend, skills gained, networking, certificates)." rows={4} {...field} disabled={isProcessing} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
        </div>


              {/* --- Dates and Contact Section (Corrected Logic) --- */}
              <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
           <h2 className="text-lg font-semibold text-card-foreground">Dates and Contact</h2>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* --- Application Start Date (Optional) --- */}
                <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Application Start Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isProcessing}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick app start date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        form.trigger("deadline"); // Validate deadline related to this
                                    }}
                                    // Disable dates AFTER the selected deadline
                                    disabled={(date) => {
                                        const deadline = form.getValues("deadline");
                                        return deadline ? date > deadline : false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                         <FormDescription className="text-xs">When applications open. Must be before or on the deadline.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* --- Application Deadline (Required) --- */}
                <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Application Deadline <span className="text-destructive">*</span></FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isProcessing}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick app deadline</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value} // Is required
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        // Validate start/end dates related to this
                                        form.trigger(["startDate", "endDate"]);
                                    }}
                                    // Disable dates BEFORE today AND BEFORE app start date
                                    disabled={(date) => {
                                         const today = new Date(new Date().setHours(0, 0, 0, 0));
                                         const startDate = form.getValues("startDate");
                                         if (date < today) return true;
                                         if (startDate && date < startDate) return true;
                                         return false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                         <FormDescription className="text-xs">Last day to apply.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                 {/* --- Opportunity End Date (Optional) --- */}
                <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Opportunity End Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isProcessing}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick event end date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={field.onChange}
                                     // Disable dates BEFORE the application deadline
                                    disabled={(date) => {
                                        const deadline = form.getValues("deadline");
                                        return deadline ? date < deadline : false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                         <FormDescription className="text-xs">When the opportunity/event finishes. Must be on or after the deadline.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
           </div>

            {/* --- Contact Info (Keep as is) --- */}
            <FormField control={form.control} name="contactInfo" render={({ field }) => (
                <FormItem>
                    <FormLabel>Contact Information <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., contact@example.com or +1-555-1234" {...field} disabled={isProcessing} /></FormControl>
                    <FormDescription>Primary contact point for inquiries.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />

            {/* --- External Link (Keep as is) --- */}
            <FormField control={form.control} name="externalLink" render={({ field }) => (
                <FormItem>
                    <FormLabel>External Link (Optional)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/apply-here" {...field} disabled={isProcessing} /></FormControl>
                    <FormDescription>Link to an external application page or website. If provided, this may override internal application features.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
        </div>


        {/* --- Additional Settings Section --- */}
         <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
           <h2 className="text-lg font-semibold text-card-foreground">Additional Settings</h2>
             <FormField control={form.control} name="isPopular" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
                 <FormControl>
                    <Checkbox
                        checked={field.value}
                        // Pass undefined if null/undefined to onCheckedChange is typical for Shadcn Checkbox
                        onCheckedChange={(checked) => field.onChange(checked)}
                        disabled={isProcessing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Featured</FormLabel>
                    <FormDescription>
                      Featured opportunities might be highlighted on the homepage or listings.
                    </FormDescription>
                  </div>
                   <FormMessage /> {/* Usually not needed here unless specific validation */}
                </FormItem>
            )} />
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isProcessing}>
            Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isProcessing}>
                {isSubmitting ? ( // Use RHF's isSubmitting for the primary save action
                    <><Spinner className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                    isEdit ? "Update Opportunity" : "Create Opportunity"
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
}