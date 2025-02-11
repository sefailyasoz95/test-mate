import React from "react";

const DashboardCard = ({ title, value, icon }: any) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition-colors animate-scaleUp">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
