export const pathMap = (path: string) => {
  const mapping: Record<string, string> = {
    "hydrocycles": "Гидроциклы",
    "boat-motors": "Лодочные моторы",
  };
  
  return mapping[path] ?? path;
};