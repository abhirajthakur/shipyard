"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface DeploymentFormProps {
  onSubmit?: (data: { name: string; project: string; commit: string }) => void;
}

export function DeploymentForm({ onSubmit }: DeploymentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    commit: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.project) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Deployment initiated successfully");

    setFormData({ name: "", project: "", commit: "" });
    setIsLoading(false);
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Deployment Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., v1.2.0 - Feature Release"
          required
          className="bg-input border-border text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Project *
        </label>
        <select
          name="project"
          value={formData.project}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a project</option>
          <option value="shipyard-web">Shipyard Web</option>
          <option value="shipyard-api">Shipyard API</option>
          <option value="shipyard-dashboard">Shipyard Dashboard</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Commit Hash
        </label>
        <Input
          type="text"
          name="commit"
          value={formData.commit}
          onChange={handleChange}
          placeholder="e.g., a3f2e1c"
          className="bg-input border-border text-foreground"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Deploying..." : "Start Deployment"}
      </Button>
    </form>
  );
}
