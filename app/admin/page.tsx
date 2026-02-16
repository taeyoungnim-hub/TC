import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [totalItems, ongoingItems, wonItems, failedItems] = await Promise.all([
    prisma.auctionItem.count(),
    prisma.auctionItem.count({ where: { status: "진행" } }),
    prisma.auctionItem.count({ where: { status: "낙찰" } }),
    prisma.auctionItem.count({ where: { status: "유찰" } }),
  ]);

  return { totalItems, ongoingItems, wonItems, failedItems };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">관리자 페이지</h1>
        <p className="text-muted-foreground">
          데이터 관리 및 시스템 설정
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 물건 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoingItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">낙찰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wonItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">유찰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>데이터 관리</CardTitle>
            <CardDescription>경매 물건 데이터 업로드 및 관리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              CSV 업로드
            </Button>
            <Button className="w-full" variant="outline">
              JSON 업로드
            </Button>
            <p className="text-xs text-muted-foreground">
              CSV 템플릿은 /public/template.csv를 참고하세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 설정</CardTitle>
            <CardDescription>추천 가중치 및 심리 지수 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              추천 가중치 조정
            </Button>
            <Button className="w-full" variant="outline">
              심리 지수 가중치 조정
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>트렌드/지수 재계산</CardTitle>
            <CardDescription>스냅샷 데이터 재생성</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              트렌드 스냅샷 재계산
            </Button>
            <Button className="w-full" variant="outline">
              심리 지수 재계산
            </Button>
            <Button className="w-full" variant="outline">
              추천 스냅샷 재계산
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>에디터 도구</CardTitle>
            <CardDescription>이색 물건 태그 및 노트 관리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/editor">에디터 노트 관리</Link>
            </Button>
            <Button className="w-full" variant="outline">
              태그 일괄 수정
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>시드 데이터</CardTitle>
          <CardDescription>
            개발/테스트용 샘플 데이터를 생성합니다 (기존 데이터 삭제됨)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            시드 데이터 생성 (npm run db:seed)
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            터미널에서 npm run db:seed 명령을 실행하세요
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
