export function humanize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .split(" ")
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
