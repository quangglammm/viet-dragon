/** What the users page needs about an account — a plain, serialisable subset of the database row. */
export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  mustChangePassword: boolean;
  /** ISO string: Dates do not cross the server → client boundary as Dates in a way we want to rely on. */
  createdAt: string;
};
