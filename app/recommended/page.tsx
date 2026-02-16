import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { calculateRecommendationScore } from "@/lib/recommendation";
import { formatCurrency, getDday } from "@/lib/utils";

export default async function RecommendedPage() {
  const items = await prisma.auctionItem.findMany({
    where: {
      status: "진행",
      bidDate: {
        gte: new Date(),
      },
    },
    include: {
      results: true,
    },
    take: 100,
  });

  const itemsWithScores = items
    .map((item) => {
      const result = calculateRecommendationScore(item, item.results);
      return {
        ...item,
        recommendationScore: result.score,
        recommendationReasons: result.reasons,
        recommendationWarnings: result.warnings,
        components: result.components,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">추천 물건</h1>
        <p className="mb-4 text-muted-foreground">
          데이터 기반 추천 점수 상위 물건입니다. 추천 점수는 할인율, 경쟁도, 유찰 상태, 리스크, 입찰 임박성을 종합적으로 고려하여 산출됩니다.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <h3 className="mb-2 font-semibold">추천 점수 산출 방법</h3>
          <ul className="space-y-1 text-sm">
            <li>• 할인 매력 (30%): 감정가 대비 최저입찰가 할인율</li>
            <li>• 경쟁도 (25%): 적정한 경쟁률 (과열되지 않은 수준)</li>
            <li>• 유찰 상태 (20%): 적당한 유찰로 인한 가격 하락 기회</li>
            <li>• 리스크 (15%): 권리관계 및 점유 리스크</li>
            <li>• 입찰 임박성 (10%): 충분한 준비 기간 확보 여부</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itemsWithScores.map((item, index) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{item.propertyType}</Badge>
                    {index < 10 && (
                      <Badge variant="secondary">TOP {index + 1}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.address}</CardTitle>
                </div>
                <div className="ml-2 text-right">
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(item.recommendationScore)}
                  </div>
                  <div className="text-xs text-muted-foreground">추천점수</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">감정가</div>
                    <div className="font-semibold">{formatCurrency(item.appraisalPrice)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">최저입찰가</div>
                    <div className="font-semibold text-primary">
                      {formatCurrency(item.minimumBidPrice)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">입찰일</div>
                  <div className="font-semibold">
                    {new Date(item.bidDate).toLocaleDateString("ko-KR")} ({getDday(item.bidDate)})
                  </div>
                </div>

                {item.recommendationReasons.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-medium">추천 사유</div>
                    <ul className="space-y-0.5 text-xs">
                      {item.recommendationReasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-green-500">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.recommendationWarnings.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.recommendationWarnings.slice(0, 2).map((warning, idx) => (
                      <span key={idx} className="text-xs text-destructive">
                        {warning}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/listings/${item.id}`}>상세 보기</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          추천 점수는 참고용입니다. 실제 투자 결정 시 반드시 전문가 상담을 받으시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
