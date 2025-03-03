"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import { Profile } from "@/lib/types/supabase";

export function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      console.log("data: ", data);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(data || []);
      setIsLoading(false);
    }

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <p className="font-medium">{user.email}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">
                      {user.subscription_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailsModal
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />
    </div>
  );
}
