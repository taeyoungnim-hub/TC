import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WatchlistPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">관심 목록</h1>
        <p className="text-muted-foreground">
          관심있는 경매 물건을 저장하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>로그인이 필요합니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            관심 목록 기능을 사용하려면 로그인이 필요합니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            MVP 버전에서는 인증 기능이 구현 중입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
