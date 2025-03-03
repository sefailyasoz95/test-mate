"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { Pencil, UserPlus, TestTube, CheckCircle } from "lucide-react";
import { TestDetailsModal } from "@/components/admin/TestDetailsModal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusBadge } from "../status-badge";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestDetailsAdded?: () => void;
}

export function UserDetailsModal({
  userId,
  open,
  onOpenChange,
  onTestDetailsAdded,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isTestDetailsModalOpen, setIsTestDetailsModalOpen] = useState(false);
  const [showTestDetailsForm, setShowTestDetailsForm] = useState(false);
  const [showTesterForm, setShowTesterForm] = useState(false);
  const [testerAccounts, setTesterAccounts] = useState("");
  const [isSubmittingTesters, setIsSubmittingTesters] = useState(false);
  const [updatingStatusAppId, setUpdatingStatusAppId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function fetchUserDetails() {
      if (!userId) return;
      setIsLoading(true);

      try {
        const [userResponse, appsResponse, purchasesResponse] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", userId).single(),
            supabase.from("apps").select("*").eq("user_id", userId),
            supabase.from("purchases").select("*").eq("user_id", userId),
          ]);

        setUser(userResponse.data);
        setApps(appsResponse.data || []);
        setPurchases(purchasesResponse.data || []);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    }

    if (open && userId) {
      fetchUserDetails();
      // Reset states when modal opens
      setSelectedAppId(null);
      setShowTestDetailsForm(false);
      setShowTesterForm(false);
      setTesterAccounts("");
    }
  }, [userId, open]);

  const handleOpenTestDetailsModal = (appId: string) => {
    setSelectedAppId(appId);
    setIsTestDetailsModalOpen(true);
  };

  const handleTestDetailsSubmitted = async () => {
    // Refresh app data after test details are submitted
    if (userId) {
      const { data } = await supabase
        .from("apps")
        .select("*")
        .eq("user_id", userId);
      setApps(data || []);
    }
    setIsTestDetailsModalOpen(false);
  };

  const handleAddTestDetails = (appId: string) => {
    setSelectedAppId(appId);
    setShowTestDetailsForm(true);
    setShowTesterForm(false);
  };

  const handleAddTesters = (appId: string) => {
    setSelectedAppId(appId);
    setShowTesterForm(true);
    setShowTestDetailsForm(false);

    // Fetch current tester accounts if any
    const app = apps.find((a) => a.id === appId);
    if (app && app.tester_accounts) {
      setTesterAccounts(app.tester_accounts);
    } else {
      setTesterAccounts("");
    }
  };

  const handleSubmitTesters = async () => {
    if (!selectedAppId) return;

    setIsSubmittingTesters(true);

    try {
      const response = await fetch("/api/apps/update-testers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: selectedAppId,
          testerAccounts,
          status: "testers_added",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update tester accounts");
      }

      toast.success("Tester accounts added successfully!");
      setShowTesterForm(false);

      // Refresh apps data
      const { data: appsData } = await supabase
        .from("apps")
        .select("*")
        .eq("user_id", userId);

      setApps(appsData || []);

      if (onTestDetailsAdded) {
        onTestDetailsAdded();
      }
    } catch (error) {
      console.error("Error updating tester accounts:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update tester accounts"
      );
    } finally {
      setIsSubmittingTesters(false);
    }
  };

  const handleTestStartedChange = async (appId: string, checked: boolean) => {
    if (!checked) return; // Only handle the "checked" state

    setUpdatingStatusAppId(appId);

    try {
      const response = await fetch("/api/apps/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId,
          status: "test_started",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update app status");
      }

      toast.success("App status updated to Test Started");

      // Update local state
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.id === appId ? { ...app, status: "test_started" } : app
        )
      );
    } catch (error) {
      console.error("Error updating app status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update app status"
      );
    } finally {
      setUpdatingStatusAppId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-medium">Email: {user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined:{" "}
                      {user?.created_at &&
                        new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      <span className="capitalize">
                        {user?.subscription_status}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Apps ({apps.length})
                </h3>
                <div className="space-y-4">
                  {apps.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{app.name}</p>
                              {app.status && getStatusBadge(app.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.package_name}
                            </p>
                            {app.play_store_link && (
                              <a
                                href={app.play_store_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                              >
                                View on Play Store
                              </a>
                            )}
                            {app.app_review && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Review:</span>{" "}
                                {app.app_review}
                              </p>
                            )}
                            {app.app_screenshots &&
                              app.app_screenshots.length > 0 && (
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Screenshots:
                                  </span>{" "}
                                  {app.app_screenshots.length} images
                                </p>
                              )}
                            {app.tester_accounts && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">
                                  Tester Accounts:
                                </span>{" "}
                                <span className="text-green-600">
                                  <CheckCircle className="inline h-4 w-4 mr-1" />
                                  Added
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddTestDetails(app.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Test Details
                            </Button>

                            {app.tester_accounts ? (
                              app.status !== "test_started" ? (
                                <div className="inline-flex items-center space-x-2 mt-2">
                                  <Checkbox
                                    id={`test-started-${app.id}`}
                                    checked={app.status === "test_started"}
                                    onCheckedChange={(checked) =>
                                      handleTestStartedChange(
                                        app.id,
                                        checked === true
                                      )
                                    }
                                    disabled={updatingStatusAppId === app.id}
                                  />
                                  <div className="grid gap-1 leading-none">
                                    <label
                                      htmlFor={`test-started-${app.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Mark test as started
                                    </label>
                                  </div>
                                  {updatingStatusAppId === app.id && (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                  )}
                                </div>
                              ) : null
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddTesters(app.id)}
                              >
                                <TestTube className="h-4 w-4 mr-2" />
                                Add Testers
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Purchases ({purchases.length})
                </h3>
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {purchase.package_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                purchase.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${purchase.amount.toFixed(2)}
                            </p>
                            <p className="text-sm capitalize text-muted-foreground">
                              {purchase.status}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {showTesterForm && selectedAppId && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-medium">Add Tester Accounts</h3>
                  <div className="space-y-2">
                    <Label htmlFor="testerAccounts">Tester Accounts</Label>
                    <Textarea
                      id="testerAccounts"
                      placeholder="Enter tester account details (email:password format, one per line)"
                      value={testerAccounts}
                      onChange={(e) => setTesterAccounts(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTesterForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitTesters}
                      disabled={isSubmittingTesters}
                    >
                      {isSubmittingTesters && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Tester Accounts
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedAppId && (
        <TestDetailsModal
          appId={selectedAppId}
          open={isTestDetailsModalOpen}
          onOpenChange={setIsTestDetailsModalOpen}
          onSubmitted={handleTestDetailsSubmitted}
        />
      )}
    </>
  );
}
