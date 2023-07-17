// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { FilmId } from './Film';
import type { CategoryId } from './Category';
import type { ColumnType } from 'kysely';

/** Represents the table public.film_category */
export default interface FilmCategoryTable {
  film_id: ColumnType<FilmId, FilmId, FilmId | null>;

  category_id: ColumnType<CategoryId, CategoryId, CategoryId | null>;

  last_update: ColumnType<Date | string, Date | string | null, Date | string | null>;
}

export type FilmCategory = FilmCategoryTable;
