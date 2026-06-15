export type ToastTone = "success" | "failure" | "info";

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}
