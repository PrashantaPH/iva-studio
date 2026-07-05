import {
  FiZap,
  FiMessageCircle,
  FiCode,
  FiGitBranch,
  FiGlobe,
  FiCpu,
  FiPlay,
  FiDatabase,
  FiFilter,
  FiStopCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { FlowNodeType } from "@/core/types/dto";

export interface WidgetDef {
  type: FlowNodeType;
  label: string;
  icon: IconType;
  color: string;
  description: string;
}

export const WIDGETS: WidgetDef[] = [
  {
    type: "trigger",
    label: "Trigger",
    icon: FiZap,
    color: "orange",
    description: "Entry point for the flow",
  },
  {
    type: "message",
    label: "Message",
    icon: FiMessageCircle,
    color: "blue",
    description: "Send a message to the user",
  },
  {
    type: "code",
    label: "Code",
    icon: FiCode,
    color: "purple",
    description: "Run custom JavaScript",
  },
  {
    type: "branch",
    label: "Branch",
    icon: FiGitBranch,
    color: "teal",
    description: "Split flow into paths",
  },
  {
    type: "callApi",
    label: "Call API",
    icon: FiGlobe,
    color: "cyan",
    description: "Invoke a proxy script / HTTP",
  },
  {
    type: "model",
    label: "Model",
    icon: FiCpu,
    color: "green",
    description: "Run NLU / Answer Bot",
  },
  {
    type: "action",
    label: "Action",
    icon: FiPlay,
    color: "pink",
    description: "Perform a system action",
  },
  {
    type: "data",
    label: "Data",
    icon: FiDatabase,
    color: "yellow",
    description: "Read / write data",
  },
  {
    type: "condition",
    label: "Condition",
    icon: FiFilter,
    color: "red",
    description: "Conditional gate",
  },
  {
    type: "end",
    label: "End",
    icon: FiStopCircle,
    color: "gray",
    description: "Terminate the flow",
  },
];

export const widgetByType = (type: FlowNodeType): WidgetDef =>
  WIDGETS.find((w) => w.type === type) ?? WIDGETS[0];
