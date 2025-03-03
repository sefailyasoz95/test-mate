export type Profile = {
  id: string;
  email: string;
  google_id: string | null;
  created_at: string;
  updated_at: string;
  subscription_status: "active" | "cancelled" | "expired";
};

export type Purchase = {
  id: string;
  user_id: string;
  package_type: "single_tester" | "full_package" | "light_test" | "deep_test";
  amount: number;
  status: string;
  created_at: string;
  expires_at: string;
};

export type TesterAccount = {
  id: string;
  email: string;
  status: "available" | "assigned";
  assigned_to: string | null;
  assigned_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan_type: "single_tester" | "full_package" | "light_test" | "deep_test";
  status: "active" | "cancelled" | "expired";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
};

export type App = {
  id: string;
  user_id: string;
  name: string;
  package_name: string;
  play_store_link: string | null;
  app_review: string | null;
  app_screenshots: string[] | null;
  created_at: Date;
  tester_accounts: string | null;
  status:
    | "purchased"
    | "waiting_for_purchase"
    | "testers_added"
    | "testers_added_google_play"
    | "test_started"
    | "test_review_completed";
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, "id" | "created_at">;
        Update: Partial<Omit<Purchase, "id" | "created_at">>;
      };
      tester_accounts: {
        Row: TesterAccount;
        Insert: Omit<TesterAccount, "id" | "created_at">;
        Update: Partial<Omit<TesterAccount, "id" | "created_at">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
      };
      apps: {
        Row: App;
        Insert: Omit<App, "id" | "created_at">;
        Update: Partial<Omit<App, "id" | "created_at">>;
      };
    };
  };
};
