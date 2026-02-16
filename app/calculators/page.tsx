"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CalculatorsPage() {
  const [appraisal, setAppraisal] = useState<number>(300000000);
  const [bidPrice, setBidPrice] = useState<number>(240000000);
  const [loanAmount, setLoanAmount] = useState<number>(150000000);
  const [loanRate, setLoanRate] = useState<number>(4.5);
  const [loanYears, setLoanYears] = useState<number>(20);

  const acquisitionTax = bidPrice * 0.04;
  const registrationFee = bidPrice * 0.002;
  const agentFee = bidPrice * 0.005;
  const totalAcquisition = bidPrice + acquisitionTax + registrationFee + agentFee;

  const monthlyPayment =
    loanAmount *
    ((loanRate / 100 / 12) * Math.pow(1 + loanRate / 100 / 12, loanYears * 12)) /
    (Math.pow(1 + loanRate / 100 / 12, loanYears * 12) - 1);

  const totalInterest = monthlyPayment * loanYears * 12 - loanAmount;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">경매 계산기</h1>
        <p className="text-muted-foreground">
          취득비용, 대출 이자, ROI 등을 간단히 계산해보세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>취득비용 계산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">감정가 (원)</label>
                <input
                  type="number"
                  value={appraisal}
                  onChange={(e) => setAppraisal(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">예상 낙찰가 (원)</label>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-3 font-semibold">상세 내역</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>낙찰가</span>
                    <span className="font-semibold">
                      {bidPrice.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>취득세 (4%)</span>
                    <span>{acquisitionTax.toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>등록면허세 (0.2%)</span>
                    <span>{registrationFee.toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>기타 비용 (0.5%)</span>
                    <span>{agentFee.toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>총 취득비용</span>
                    <span className="text-primary">
                      {totalAcquisition.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>대출 이자 계산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">대출 금액 (원)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">금리 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">대출 기간 (년)</label>
                <input
                  type="number"
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-3 font-semibold">상세 내역</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>대출 원금</span>
                    <span className="font-semibold">
                      {loanAmount.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>월 상환액</span>
                    <span className="font-semibold text-primary">
                      {Math.round(monthlyPayment).toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 이자</span>
                    <span>{Math.round(totalInterest).toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>총 상환액</span>
                    <span className="text-destructive">
                      {Math.round(loanAmount + totalInterest).toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ROI 간단 계산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="mb-2">
                투자수익률(ROI)은 매입가격, 매도가격, 보유기간, 임대수익 등 여러 요소를 고려해야 합니다.
              </p>
              <p>
                정확한 수익성 분석을 위해서는 전문가의 상담을 받으시기 바랍니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
