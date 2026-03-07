"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDeployment } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewDeploymentForm() {
  const [formData, setFormData] = useState({
    repoUrl: "",
    buildCommand: "npm run build",
    outputDir: "dist",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    console.log({ name, value });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!formData.repoUrl || !formData.buildCommand || !formData.outputDir) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      await createDeployment({
        repoUrl: formData.repoUrl,
        buildCommand: formData.buildCommand,
        outputDir: formData.outputDir,
      });

      toast.success("Deployment initiated successfully");

      setFormData({
        repoUrl: "",
        buildCommand: "npm run build",
        outputDir: "dist",
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to initiate deployment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          GitHub Repository URL
        </label>
        <Input
          type="url"
          name="repoUrl"
          value={formData.repoUrl}
          onChange={handleChange}
          placeholder="https://github.com/user/repo"
          required
          className="bg-input border-border text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Build Command
        </label>
        <Input
          type="text"
          name="buildCommand"
          value={formData.buildCommand}
          onChange={handleChange}
          placeholder="npm run build"
          required
          className="bg-input border-border text-foreground font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Output Directory
        </label>
        <Input
          type="text"
          name="outputDir"
          value={formData.outputDir}
          onChange={handleChange}
          placeholder="dist"
          required
          className="bg-input border-border text-foreground font-mono"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        className="w-full text-base"
      >
        {isLoading ? "Deploying..." : "Deploy"}
      </Button>
    </form>
  );
}
