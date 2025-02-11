"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateAppForm } from "@/components/dashboard/CreateAppForm";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AllocateTestersModal } from "@/components/dashboard/AllocateTestersModal";

interface App {
  id: string;
  name: string;
  package_name: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  subscription_status: "active" | "cancelled" | "expired";
}

export function DashboardTabs({
  initialProfile,
}: {
  initialProfile: Profile | null;
}) {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApps = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApps(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex justify-center mb-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        {!initialProfile ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No profile data available. Please complete your profile setup.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">
                  {initialProfile.subscription_status}
                </p>
              </CardContent>
            </Card>
            {/* Add more cards for other overview data */}
          </div>
        )}
      </TabsContent>

      <TabsContent value="apps" className="space-y-4">
        <div className="flex justify-between items-center">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Apps</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add App
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New App</DialogTitle>
                  </DialogHeader>
                  <CreateAppForm
                    onSuccess={() => {
                      fetchApps();
                    }}
                    onCancel={() => {
                      const dialogTrigger = document.querySelector(
                        '[aria-label="Close"]'
                      );
                      if (dialogTrigger instanceof HTMLButtonElement) {
                        dialogTrigger.click();
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-muted-foreground">Loading apps...</p>
                ) : apps.length === 0 ? (
                  <p className="text-muted-foreground">
                    No apps registered yet.
                  </p>
                ) : (
                  apps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.package_name}
                        </p>
                      </div>
                      <AllocateTestersModal
                        appId={app.id}
                        appName={app.name}
                        userId={initialProfile?.id || ""}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
