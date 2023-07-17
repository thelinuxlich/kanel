// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { CustomerId } from './Customer';
import type { ColumnType } from 'kysely';

/** Represents the view public.customer_list */
export default interface CustomerListTable {
  id: ColumnType<CustomerId, never, never>;

  name: ColumnType<string, never, never>;

  address: ColumnType<string, never, never>;

  'zip code': ColumnType<string | null, never, never>;

  phone: ColumnType<string, never, never>;

  city: ColumnType<string, never, never>;

  country: ColumnType<string, never, never>;

  notes: ColumnType<string, never, never>;

  sid: ColumnType<number, never, never>;
}

export type CustomerList = CustomerListTable;
