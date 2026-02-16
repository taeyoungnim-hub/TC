import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 숫자 포맷팅
export function formatCurrency(amount: number | bigint): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(Number(amount));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// D-Day 계산
export function getDday(targetDate: Date | string): string {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return "종료";
  if (diff === 0) return "D-Day";
  return `D-${diff}`;
}

// 할인율 계산
export function calculateDiscountRate(appraisalPrice: bigint, minimumBidPrice: bigint): number {
  const discount = (1 - Number(minimumBidPrice) / Number(appraisalPrice)) * 100;
  return Math.round(discount * 100) / 100;
}

// 낙찰가율 계산
export function calculateWinningRate(appraisalPrice: bigint, winningBidPrice: bigint): number {
  const rate = (Number(winningBidPrice) / Number(appraisalPrice)) * 100;
  return Math.round(rate * 100) / 100;
}
