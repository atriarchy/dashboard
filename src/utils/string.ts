export function normalize(str: string): string {
  return str
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .split(" ")
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
