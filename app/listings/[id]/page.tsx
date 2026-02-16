import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { calculateRecommendationScore } from "@/lib/recommendation";
import { formatCurrency, formatNumber, getDday, calculateDiscountRate } from "@/lib/utils";
import { AlertTriangle, Calendar, MapPin, FileText, TrendingUp } from "lucide-react";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.auctionItem.findUnique({
    where: { id },
    include: {
      results: {
        orderBy: {
          resultDate: "desc",
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const recommendation = calculateRecommendationScore(item, item.results);
  const discountRate = calculateDiscountRate(item.appraisalPrice, item.minimumBidPrice);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Badge>{item.propertyType}</Badge>
          <Badge variant="outline">{item.status}</Badge>
          {item.unusualTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="mb-4 text-3xl font-bold">{item.address}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {item.regionSiDo} {item.regionSiGunGu}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {item.court} {item.caseNumber}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {item.eventRound}회차
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Info */}
          <Card>
            <CardHeader>
              <CardTitle>가격 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">감정가</div>
                  <div className="text-2xl font-bold">{formatCurrency(item.appraisalPrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">최저입찰가</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(item.minimumBidPrice)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm text-muted-foreground">할인율</div>
                <div className="text-xl font-bold text-green-600">
                  {discountRate.toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auction Info */}
          <Card>
            <CardHeader>
              <CardTitle>경매 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">입찰일</div>
                  <div className="font-semibold">
                    {new Date(item.bidDate).toLocaleDateString("ko-KR")}
                  </div>
                  <div className="text-sm text-primary">{getDday(item.bidDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">회차</div>
                  <div className="font-semibold">{item.eventRound}회차</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">법원</div>
                <div className="font-semibold">{item.court}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">사건번호</div>
                <div className="font-semibold">{item.caseNumber}</div>
              </div>
            </CardContent>
          </Card>

          {/* Rights & Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle>권리 및 점유 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.occupancyStatus && (
                <div>
                  <div className="text-sm text-muted-foreground">점유 상태</div>
                  <div className="font-semibold">{item.occupancyStatus}</div>
                </div>
              )}
              {item.tenantNotes && (
                <div>
                  <div className="text-sm text-muted-foreground">임차인 정보</div>
                  <div className="rounded-md bg-muted p-3 text-sm">{item.tenantNotes}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">권리 관계</div>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {item.rightsNotes || "특이사항 없음"}
                </div>
              </div>
              {item.riskFlags.length > 0 && (
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">리스크 플래그</div>
                  <div className="flex flex-wrap gap-2">
                    {item.riskFlags.map((flag) => (
                      <Badge key={flag} variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auction Results */}
          {item.results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>입찰 이력</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.results.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-md border p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold">{formatCurrency(result.winningBidPrice)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.resultDate).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">입찰자 수</div>
                        <div className="font-semibold">{result.bidderCount}명</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editor Note */}
          {item.editorNote && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  에디터 노트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.editorNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommendation Score */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>추천 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <div className="text-5xl font-bold text-primary">
                  {Math.round(recommendation.score)}
                </div>
                <div className="text-sm text-muted-foreground">/ 100점</div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-2 text-sm font-medium">점수 구성</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>할인 매력</span>
                      <span className="font-semibold">
                        {Math.round(recommendation.components.discountScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>경쟁도</span>
                      <span className="font-semibold">
                        {Math.round(recommendation.components.competitionScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>유찰 상태</span>
                      <span className="font-semibold">
                        {Math.round(recommendation.components.auctionRoundScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>리스크</span>
                      <span className="font-semibold">
                        {Math.round(recommendation.components.riskScore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>입찰 임박성</span>
                      <span className="font-semibold">
                        {Math.round(recommendation.components.urgencyScore)}
                      </span>
                    </div>
                  </div>
                </div>

                {recommendation.reasons.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">추천 사유</div>
                    <ul className="space-y-1 text-sm">
                      {recommendation.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.warnings.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">주의사항</div>
                    <ul className="space-y-1 text-sm">
                      {recommendation.warnings.map((warning, idx) => (
                        <li key={idx} className="text-destructive">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button className="w-full">관심목록에 추가</Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/calculators?itemId=${item.id}`}>수익성 계산하기</Link>
                </Button>
                {item.sourceUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                      원본 페이지 보기
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
