import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              경매 인사이트
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/listings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              물건 검색
            </Link>
            <Link
              href="/recommended"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              추천 물건
            </Link>
            <Link
              href="/trends"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              트렌드
            </Link>
            <Link
              href="/unusual"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              이색 물건
            </Link>
            <Link
              href="/sentiment"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              심리 지수
            </Link>
            <Link
              href="/learn"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              학습 센터
            </Link>
            <Link
              href="/calculators"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              계산기
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/watchlist">관심목록</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">관리자</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
