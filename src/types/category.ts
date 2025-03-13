export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface CategoryWithOpportunityCount extends Category {
  _count: {
    opportunities: number;
  };
} 