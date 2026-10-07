import { deactivatePushToken, getActivePushTokensForOrder } from "./db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type OrderNotificationInput = {
  id: number;
  status: string;
  fulfillmentStatus: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
};

export async function sendOrderStatusNotification(order: OrderNotificationInput) {
  const recipients = await getActivePushTokensForOrder(order);
  if (recipients.length === 0) return { sent: 0, deactivated: 0 };

  const readableStatus = order.fulfillmentStatus.replace(/_/g, " ");
  const title = order.fulfillmentStatus === "delivered" ? "S.M FARMS order delivered" : "S.M FARMS order update";
  const body = order.fulfillmentStatus === "shipped" && order.trackingNumber
    ? `Order #${order.id} shipped via ${order.carrier || "our delivery partner"}. Tracking: ${order.trackingNumber}.`
    : `Order #${order.id} is now ${readableStatus}.`;
  const messages = recipients.map(({ token }) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: { orderId: order.id, fulfillmentStatus: order.fulfillmentStatus, status: order.status },
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    const result = await response.json() as { data?: Array<{ details?: { error?: string } }> };
    if (!response.ok) {
      console.warn("[Push] Expo Push Service rejected notification batch", response.status, result);
      return { sent: 0, deactivated: 0 };
    }
    let deactivated = 0;
    const tickets = result.data || [];
    for (let index = 0; index < tickets.length; index += 1) {
      const ticket = tickets[index];
      if (ticket.details?.error === "DeviceNotRegistered") {
        await deactivatePushToken(messages[index].to);
        deactivated += 1;
      }
    }
    return { sent: messages.length - deactivated, deactivated };
  } catch (error) {
    console.warn("[Push] Notification delivery failed", error instanceof Error ? error.message : error);
    return { sent: 0, deactivated: 0 };
  }
}

export function isExpoPushToken(value: string) {
  return /^ExponentPushToken\[.+\]$/.test(value) || /^ExpoPushToken\[.+\]$/.test(value);
}

export type { OrderNotificationInput };
export { EXPO_PUSH_URL };
