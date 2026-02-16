import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getDday } from "@/lib/utils";

interface SearchParams {
  page?: string;
  propertyType?: string;
  region?: string;
  status?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;

  const where: any = {};

  if (params.propertyType && params.propertyType !== "전체") {
    where.propertyType = params.propertyType;
  }

  if (params.region && params.region !== "전국") {
    const [siDo, siGunGu] = params.region.split("-");
    if (siGunGu) {
      where.regionSiDo = siDo;
      where.regionSiGunGu = siGunGu;
    } else {
      where.regionSiDo = siDo;
    }
  }

  if (params.status && params.status !== "전체") {
    where.status = params.status;
  }

  const [items, totalCount] = await Promise.all([
    prisma.auctionItem.findMany({
      where,
      orderBy: {
        bidDate: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auctionItem.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">경매 물건 검색</h1>
        <p className="text-muted-foreground">총 {totalCount}건의 물건</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <select
            className="rounded-md border border-input bg-background px-3 py-2"
            defaultValue={params.propertyType || "전체"}
          >
            <option value="전체">전체 물건종류</option>
            <option value="아파트">아파트</option>
            <option value="오피스텔">오피스텔</option>
            <option value="다세대">다세대</option>
            <option value="상가">상가</option>
            <option value="토지">토지</option>
          </select>
        </div>

        <div>
          <select
            className="rounded-md border border-input bg-background px-3 py-2"
            defaultValue={params.status || "전체"}
          >
            <option value="전체">전체 상태</option>
            <option value="진행">진행</option>
            <option value="낙찰">낙찰</option>
            <option value="유찰">유찰</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2">{item.propertyType}</Badge>
                  <Badge variant="outline" className="ml-2">
                    {item.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.eventRound}회차</div>
                </div>
              </div>
              <CardTitle className="text-lg">{item.address}</CardTitle>
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
                {item.riskFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.riskFlags.map((flag) => (
                      <Badge key={flag} variant="destructive" className="text-xs">
                        {flag}
                      </Badge>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/listings?page=${page - 1}`}>이전</Link>
            </Button>
          )}
          <span className="flex items-center px-4">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/listings?page=${page + 1}`}>다음</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
