import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { calculateRecommendationScore } from "@/lib/recommendation";
import { formatCurrency, formatNumber, getDday } from "@/lib/utils";
import { ArrowRight, TrendingUp, AlertTriangle, Map } from "lucide-react";

async function getTopRecommendations() {
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
    take: 50,
  });

  const itemsWithScores = items
    .map((item) => {
      const result = calculateRecommendationScore(item, item.results);
      return {
        ...item,
        recommendationScore: result.score,
        recommendationReasons: result.reasons,
        recommendationWarnings: result.warnings,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10);

  return itemsWithScores;
}

async function getUnusualItems() {
  const items = await prisma.auctionItem.findMany({
    where: {
      status: "진행",
      unusualTags: {
        isEmpty: false,
      },
    },
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

async function getMarketSummary() {
  const totalItems = await prisma.auctionItem.count();
  const ongoingItems = await prisma.auctionItem.count({
    where: { status: "진행" },
  });

  // 최근 30일 낙찰 데이터
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentResults = await prisma.auctionResult.findMany({
    where: {
      resultDate: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      item: true,
    },
  });

  const avgWinningRate =
    recentResults.length > 0
      ? recentResults.reduce((sum, r) => {
          const rate = (Number(r.winningBidPrice) / Number(r.item.appraisalPrice)) * 100;
          return sum + rate;
        }, 0) / recentResults.length
      : 0;

  const avgBidderCount =
    recentResults.length > 0
      ? recentResults.reduce((sum, r) => sum + r.bidderCount, 0) / recentResults.length
      : 0;

  return {
    totalItems,
    ongoingItems,
    avgWinningRate: Math.round(avgWinningRate * 100) / 100,
    avgBidderCount: Math.round(avgBidderCount * 100) / 100,
  };
}

export default async function HomePage() {
  const topRecommendations = await getTopRecommendations();
  const unusualItems = await getUnusualItems();
  const marketSummary = await getMarketSummary();

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
          데이터 기반 부동산 경매 인사이트
        </h1>
        <p className="mb-6 text-xl text-muted-foreground">
          스마트한 경매 투자를 위한 추천, 분석, 트렌드 정보
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/recommended">
              추천 물건 보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/listings">전체 물건 검색</Link>
          </Button>
        </div>
      </section>

      {/* Market Summary Cards */}
      <section className="mb-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 물건 수</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(marketSummary.totalItems)}</div>
              <p className="text-xs text-muted-foreground">
                진행 중: {formatNumber(marketSummary.ongoingItems)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 낙찰가율</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketSummary.avgWinningRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">최근 30일 기준</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 경쟁률</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketSummary.avgBidderCount.toFixed(1)}명
              </div>
              <p className="text-xs text-muted-foreground">입찰자 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">심리 지수</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/sentiment" className="text-primary hover:underline">
                  자세히 보기
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Recommendations */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">이번 주 추천 물건 TOP 10</h2>
            <p className="text-muted-foreground">데이터 기반 추천 점수 상위 물건</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/recommended">전체 보기</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topRecommendations.slice(0, 6).map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="mb-2">{item.propertyType}</Badge>
                    <CardTitle className="text-lg">{item.address}</CardTitle>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(item.recommendationScore)}
                    </div>
                    <div className="text-xs text-muted-foreground">추천점수</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">감정가</div>
                    <div className="font-semibold">{formatCurrency(item.appraisalPrice)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">최저입찰가</div>
                    <div className="font-semibold text-primary">
                      {formatCurrency(item.minimumBidPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">입찰일</div>
                    <div className="font-semibold">
                      {new Date(item.bidDate).toLocaleDateString("ko-KR")} ({getDday(item.bidDate)})
                    </div>
                  </div>
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
      </section>

      {/* Unusual Items */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">이색 물건 소개</h2>
            <p className="text-muted-foreground">특별한 기회와 주의가 필요한 물건</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/unusual">전체 보기</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unusualItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">
                  {item.unusualTags[0]}
                </Badge>
                <CardTitle className="text-lg">{item.address}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {item.unusualTags.slice(1).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">최저입찰가</div>
                    <div className="font-semibold">{formatCurrency(item.minimumBidPrice)}</div>
                  </div>
                  {item.editorNote && (
                    <div className="rounded-md bg-muted p-2 text-sm">{item.editorNote}</div>
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
      </section>

      {/* Quick Links */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>학습 센터</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                경매 기본부터 전문가 전략까지
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/learn">학습하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>계산기</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                ROI, 자금계획, 취득비용 계산
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/calculators">계산하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>트렌드 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                시장 동향과 데이터 인사이트
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/trends">분석 보기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
