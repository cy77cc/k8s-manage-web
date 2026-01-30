"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface NotificationData {
  task_id: string;
  step: string;
  status: "success" | "error" | "running";
  message: string;
}

export function NotificationListener() {
  useEffect(() => {
    // 建立 SSE 连接
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);

        // 根据状态显示不同类型的 toast
        if (data.status === "success") {
          toast.success(data.message, {
            description: `任务ID: ${data.task_id} | 步骤: ${data.step}`,
            duration: 5000,
          });
        } else if (data.status === "error") {
          toast.error(data.message, {
            description: `任务ID: ${data.task_id} | 步骤: ${data.step}`,
            duration: 0, // 错误通常不自动消失
          });
        } else {
          toast(data.message, {
            description: `任务ID: ${data.task_id} | 步骤: ${data.step}`,
          });
        }
      } catch (e) {
        console.error("Failed to parse notification:", e);
      }
    };

    eventSource.onerror = (err) => {
      // 在开发环境中，Next.js 的 HMR 可能会导致连接频繁重置，这是正常的
      console.log("SSE Connection closed or error", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return null;
}
