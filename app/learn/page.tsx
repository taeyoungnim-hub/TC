import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LearnPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">학습 센터</h1>
        <p className="text-muted-foreground">
          부동산 경매의 기본부터 전문가 전략까지 학습하세요.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>경매 기본 용어</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-semibold">감정가</h4>
                <p className="text-sm text-muted-foreground">
                  법원이 부동산의 가치를 평가한 금액입니다.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">최저입찰가</h4>
                <p className="text-sm text-muted-foreground">
                  입찰할 수 있는 최소 금액입니다. 감정가의 일정 비율로 결정됩니다.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">낙찰가율</h4>
                <p className="text-sm text-muted-foreground">
                  낙찰가를 감정가로 나눈 비율입니다. 시장 열기를 가늠할 수 있습니다.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">유찰</h4>
                <p className="text-sm text-muted-foreground">
                  입찰자가 없거나 최고가 입찰자가 낙찰을 받지 않아 경매가 성립하지 않은 경우입니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>경매 투자 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge className="mb-2">1단계: 물건 선정</Badge>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>✓ 입지 및 시세 조사</li>
                  <li>✓ 감정가 적정성 검토</li>
                  <li>✓ 할인율 확인</li>
                </ul>
              </div>
              <div>
                <Badge className="mb-2">2단계: 권리분석</Badge>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>✓ 등기부등본 확인</li>
                  <li>✓ 선순위 권리 파악</li>
                  <li>✓ 유치권, 법정지상권 검토</li>
                </ul>
              </div>
              <div>
                <Badge className="mb-2">3단계: 현장조사</Badge>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>✓ 물건 상태 확인</li>
                  <li>✓ 점유자 파악</li>
                  <li>✓ 주변 환경 조사</li>
                </ul>
              </div>
              <div>
                <Badge className="mb-2">4단계: 수익성 분석</Badge>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>✓ 예상 낙찰가 산정</li>
                  <li>✓ 취득비용 계산 (취득세, 등록세 등)</li>
                  <li>✓ 명도비용 추정</li>
                  <li>✓ ROI 계산</li>
                </ul>
              </div>
              <div>
                <Badge className="mb-2">5단계: 자금계획</Badge>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>✓ 자기자본 확보</li>
                  <li>✓ 대출 가능 여부 확인</li>
                  <li>✓ 보증금 및 잔금 납부 계획</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주의사항 (SOP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">권리분석</p>
              <ul className="ml-4 space-y-1">
                <li>• 등기부등본을 반드시 직접 확인하세요</li>
                <li>• 선순위 권리는 낙찰자가 인수해야 합니다</li>
                <li>• 유치권 가능성은 현장 조사로 파악하세요</li>
              </ul>

              <p className="font-semibold mt-4">명도</p>
              <ul className="ml-4 space-y-1">
                <li>• 점유자와의 협의가 우선입니다</li>
                <li>• 법적 명도는 시간과 비용이 많이 듭니다</li>
                <li>• 명도비용을 충분히 고려하세요</li>
              </ul>

              <p className="font-semibold mt-4">세금</p>
              <ul className="ml-4 space-y-1">
                <li>• 취득세: 낙찰가의 4% (주택 기준)</li>
                <li>• 농어촌특별세, 지방교육세 추가</li>
                <li>• 양도소득세는 매도 시 고려</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
