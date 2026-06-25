export interface NoveltyResponse {
  id: number;
  title: string;
  description: string;
  minPercentage: number | null;
  maxPercentage: number | null;
  actionRecommended: string;
}
