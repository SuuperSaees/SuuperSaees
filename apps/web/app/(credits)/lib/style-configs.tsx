import { CheckCircle, Clock, ShoppingCart, Lock } from "lucide-react";

type StatusKey = "available" | "used" | "purchased" | "expired" | "locked";

export const getStatusConfig = (key: StatusKey) => {
  return statusConfig.find((status) => status.key === key);
};

export const statusConfig: Array<{
  key: StatusKey;
  icon: React.ReactNode;
  accent: string;
}> = [
  {
    key: "available",
    icon: <CheckCircle className="text-gray-500 w-6 h-6" />,
    accent: "text-black",
  },
  {
    key: "used",
    icon: <ShoppingCart className="text-gray-500 w-6 h-6" />,
    accent: "text-black",
  },
  {
    key: "purchased",
    icon: <ShoppingCart className="text-gray-500 w-6 h-6" />,
    accent: "text-black",
  },
  {
    key: "expired",
    icon: <Clock className="text-gray-500 w-6 h-6" />,
    accent: "text-black",
  },
  {
    key: "locked",
    icon: <Lock className="text-gray-500 w-6 h-6" />,
    accent: "text-black",
  },
];