export type UserRole = 'reader' | 'writer' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          birth_date: string | null
          phone: string | null
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          birth_date?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
        }
        Update: {
          birth_date?: string | null
          phone?: string | null
          role?: UserRole
        }
      }
      articles: {
        Row: {
          id: string
          author_id: string
          title: string
          summary: string | null
          document_path: string | null
          image_path: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          summary?: string | null
          document_path?: string | null
          image_path?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          summary?: string | null
          document_path?: string | null
          image_path?: string | null
          is_public?: boolean
        }
      }
      views: {
        Row: {
          id: string
          article_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          viewed_at?: string
        }
        Update: never
      }
      likes: {
        Row: {
          id: string
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          comment?: string
        }
      }
      favorites: {
        Row: {
          id: string
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}
