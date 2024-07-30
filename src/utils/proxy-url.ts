export function proxyUrl(url: string) {
  const u = new URL(url)
  const preHost = u.host
  u.host = 'proxy.viki.moe'
  u.searchParams.set('proxy-host', preHost)
  return u.toString()
}
