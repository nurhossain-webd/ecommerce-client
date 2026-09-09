# Cart presentation

Cart state lives in `CartContext`, persists under `shopstack_cart`, and stores product snapshots with bounded quantities. The navbar button links to `/cart` and shows total item quantity.

Checkout submits only product IDs and quantities. Displayed prices are estimates; the backend remains authoritative for current prices and stock.
