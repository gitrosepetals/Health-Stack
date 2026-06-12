export interface AdminUser {
  id: string;
  email: string;
}

export interface AdminArticle {
  id: string;
  slug: string;
  db_id?: string;
  category: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  status: 'draft' | 'published';
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}
