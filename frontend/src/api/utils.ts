export default function constructQueryString(
  params: Record<string, string> | undefined
): string {
  if (!params) return "";
  const query = new URLSearchParams(params);
  return `?${query.toString()}`;
}
