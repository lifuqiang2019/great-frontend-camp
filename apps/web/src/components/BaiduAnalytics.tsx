'use client';

import Script from 'next/script';

export default function BaiduAnalytics() {
  const baiduTongjiId = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;

  if (!baiduTongjiId) {
    return null;
  }

  return (
    <Script
      id="baidu-tongji"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?${baiduTongjiId}";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
          })();
        `,
      }}
    />
  );
}
