import React from "react";

type StatusInfo = {
  color: string;
  label: string;
};

export const getStatusBadge = (status: string): React.ReactNode => {
  const statusMap: Record<string, StatusInfo> = {
    waiting_for_purchase: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Waiting for Purchase",
    },
    purchased: {
      color: "bg-blue-100 text-blue-800",
      label: "Purchased",
    },
    testers_added: {
      color: "bg-green-100 text-green-800",
      label: "Testers Added",
    },
    testers_added_google_play: {
      color: "bg-purple-100 text-purple-800",
      label: "Testers Added to Google Play",
    },
    test_started: {
      color: "bg-indigo-100 text-indigo-800",
      label: "Test Started",
    },
  };

  const statusInfo = statusMap[status] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
    >
      {statusInfo.label}
    </span>
  );
};
