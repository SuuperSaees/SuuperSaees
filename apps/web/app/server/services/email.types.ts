// Email Types - Factory Pattern (separate file since "use server" can't export objects)
export const EMAIL = {
  INVOICES: {
    REQUEST_PAYMENT: 'invoices.requestPayment',
    PAYMENT_RECEIVED: 'invoices.paymentReceived',
  },
  ORDERS: {
    STATUS_UPDATE: 'orders.statusUpdate',
    NEW_MESSAGE: 'orders.newMessage',
  },
  CHAT: {
    NEW_MESSAGE: 'chat.newMessage',
  },
  NOTIFICATIONS: {
    GENERAL: 'notifications.general',
  },
} as const;

export type EmailType = 
  | typeof EMAIL.INVOICES.REQUEST_PAYMENT 
  | typeof EMAIL.INVOICES.PAYMENT_RECEIVED
  | typeof EMAIL.ORDERS.STATUS_UPDATE
  | typeof EMAIL.ORDERS.NEW_MESSAGE
  | typeof EMAIL.CHAT.NEW_MESSAGE
  | typeof EMAIL.NOTIFICATIONS.GENERAL;

// Email Parameters based on type
export interface EmailParams {
  [EMAIL.INVOICES.REQUEST_PAYMENT]: {
    to: string;
    userId: string;
    invoiceNumber: string;
    clientName: string;
    agencyName: string;
    amount: string;
    buttonUrl?: string;
  };
  [EMAIL.INVOICES.PAYMENT_RECEIVED]: {
    to: string;
    userId: string;
    invoiceNumber: string;
    clientName: string;
    amount: string;
  };
  [EMAIL.ORDERS.STATUS_UPDATE]: {
    to: string;
    userId: string;
    orderTitle: string;
    userName: string;
    message: string;
    orderId: string;
  };
  [EMAIL.ORDERS.NEW_MESSAGE]: {
    to: string;
    userId: string;
    orderTitle: string;
    userName: string;
    message: string;
    orderId: string;
    date: string;
  };
  [EMAIL.CHAT.NEW_MESSAGE]: {
    to: string;
    userId: string;
    senderName: string;
    chatTitle: string;
    message: string;
  };
  [EMAIL.NOTIFICATIONS.GENERAL]: {
    to: string;
    userId: string;
    subject: string;
    body: string;
    greeting?: string;
    farewell?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
} 