import { NextResponse } from 'next/server';

// 强制动态渲染，因为 SSE 需要实时流
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 辅助函数：发送 SSE 格式数据
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 模拟发送一个初始消息
      sendEvent({
        task_id: "system",
        step: "init",
        status: "success",
        message: "实时通知服务已连接"
      });

      // 模拟延时任务：2秒后完成镜像拉取
      setTimeout(() => {
        sendEvent({
          task_id: "task-101",
          step: "pull_image",
          status: "success",
          message: "镜像拉取完成"
        });
      }, 2000);

      // 模拟延时任务：5秒后完成容器创建
      setTimeout(() => {
        sendEvent({
          task_id: "task-101",
          step: "create_container",
          status: "success",
          message: "容器创建成功"
        });
      }, 5000);

      // 注意：在实际生产环境中，这里通常会监听 Redis Pub/Sub 或其他消息队列，
      // 当有新消息时调用 sendEvent。
      // 这里为了演示，我们仅仅是用了 setTimeout 模拟。
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
