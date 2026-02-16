import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TrendsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">시장 트렌드 분석</h1>
        <p className="text-muted-foreground">
          경매 시장의 주요 지표와 트렌드를 확인하세요.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>트렌드 지표</CardTitle>
            <CardDescription>지역별, 물건종류별 시장 동향</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">주요 지표</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 총 물건 수 / 신규 물건 수</li>
                  <li>• 진행 중 / 낙찰 / 유찰 물건 수</li>
                  <li>• 유찰률 / 낙찰률</li>
                  <li>• 평균 낙찰가율 (낙찰가 ÷ 감정가)</li>
                  <li>• 평균 할인율 (1 - 최저가 ÷ 감정가)</li>
                  <li>• 평균 경쟁률 (입찰자 수)</li>
                  <li>• 평균 유찰 횟수</li>
                </ul>
              </div>

              <div className="text-center text-muted-foreground py-12">
                트렌드 차트와 상세 분석은 추후 업데이트 예정입니다.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>데이터 집계 방법</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="mb-2">
              모든 트렌드 지표는 선택한 기간, 지역, 물건종류에 따라 집계됩니다.
            </p>
            <ul className="space-y-1">
              <li>• 낙찰률 = 낙찰 물건 수 ÷ (낙찰 + 유찰) × 100</li>
              <li>• 평균 낙찰가율 = Σ(낙찰가 ÷ 감정가) ÷ 낙찰 건수</li>
              <li>• 평균 할인율 = Σ(1 - 최저가 ÷ 감정가) ÷ 전체 건수</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
