import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getDday } from "@/lib/utils";

export default async function UnusualPage() {
  const items = await prisma.auctionItem.findMany({
    where: {
      unusualTags: {
        isEmpty: false,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">이색 물건</h1>
        <p className="mb-4 text-muted-foreground">
          특별한 기회와 주의가 필요한 이색 경매 물건입니다.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <h3 className="mb-2 font-semibold">이색 물건 태그 설명</h3>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            <li>• <strong>지분경매:</strong> 부동산의 일부 지분만 경매</li>
            <li>• <strong>섬/오지:</strong> 접근이 어려운 위치</li>
            <li>• <strong>법정지상권:</strong> 법정지상권 발생 가능성</li>
            <li>• <strong>분묘리스크:</strong> 분묘 및 분묘기지권 이슈</li>
            <li>• <strong>개발예정지역:</strong> 향후 개발 가능성</li>
            <li>• <strong>대규모토지:</strong> 넓은 면적의 토지</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-1">
                {item.unusualTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg">{item.address}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.propertyType}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
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
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">입찰일</div>
                  <div className="font-semibold">
                    {new Date(item.bidDate).toLocaleDateString("ko-KR")} ({getDday(item.bidDate)})
                  </div>
                </div>

                {item.editorNote && (
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <div className="mb-1 font-medium">에디터 노트</div>
                    {item.editorNote}
                  </div>
                )}

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

      {items.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          현재 등록된 이색 물건이 없습니다.
        </div>
      )}
    </div>
  );
}
