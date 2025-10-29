export function getUserId(u: any): string {
  return (u?.id ?? u?._id)?.toString();
}

