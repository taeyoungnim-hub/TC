export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2026 부동산 경매 인사이트. All rights reserved.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-1">
              ⚠️ 본 서비스는 투자 자문이나 법률 자문을 제공하지 않습니다.
            </p>
            <p>
              모든 데이터는 참고용이며, 실제 투자 결정 시 전문가 상담이 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
