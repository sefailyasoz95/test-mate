import React from "react";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info";
}

const Notification = ({ message, type = "info" }: NotificationProps) => {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown`}
    >
      {message}
    </div>
  );
};

export default Notification;
