import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SentimentPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">경매 심리 지수</h1>
        <p className="text-muted-foreground">
          시장 참여자들의 심리 상태를 4가지 구성요소로 분석합니다.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>심리 지수란?</CardTitle>
            <CardDescription>0~100 사이의 값으로 시장 심리를 수치화</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">4가지 구성요소</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>1. 열기 (Competition, 30%):</strong> 평균 입찰자 수의 변화
                    <br />
                    <span className="text-muted-foreground">최근 4주 vs 12개월 평균</span>
                  </li>
                  <li>
                    <strong>2. 공격성 (Aggression, 30%):</strong> 평균 낙찰가율 변화
                    <br />
                    <span className="text-muted-foreground">최근 vs 과거 비교</span>
                  </li>
                  <li>
                    <strong>3. 유동성 (Liquidity, 25%):</strong> 낙찰률 / 소화 속도
                    <br />
                    <span className="text-muted-foreground">유찰 횟수 및 기간 분석</span>
                  </li>
                  <li>
                    <strong>4. 리스크회피 (Risk Aversion, 15%):</strong> 평균 할인율 변화
                    <br />
                    <span className="text-muted-foreground">안전지향 정도 측정</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">지수 해석</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>70 이상:</strong> 과열 - 신중한 접근 필요</li>
                  <li>• <strong>50-70:</strong> 적정 - 건강한 시장 상태</li>
                  <li>• <strong>30-50:</strong> 관망 - 선별적 투자 시기</li>
                  <li>• <strong>30 이하:</strong> 침체 - 저가 기회 가능</li>
                </ul>
              </div>

              <div className="text-center text-muted-foreground py-12">
                심리 지수 차트와 상세 분석은 추후 업데이트 예정입니다.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle>⚠️ 주의사항</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">
              심리 지수는 시장 참여자들의 전반적인 심리 상태를 나타내는 참고 지표입니다.
            </p>
            <ul className="space-y-1">
              <li>• 투자 자문이나 매매 권유가 아닙니다</li>
              <li>• 지역별, 물건별로 실제 상황은 다를 수 있습니다</li>
              <li>• 반드시 개별 물건에 대한 철저한 분석이 필요합니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
