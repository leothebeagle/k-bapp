-- Ledger: transactions are append-only, and each insert moves its lot's balance.
-- The trigger below is the only thing that changes lots.balance.

CREATE FUNCTION apply_transaction_to_lot_balance() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE lots SET balance = balance + NEW.quantity WHERE id = NEW.lot_id;
  RETURN NULL; -- ignored for AFTER triggers
END;
$$;

-- Runs inside the INSERT statement, so a failure here rolls back the insert too.
CREATE TRIGGER transactions_apply_balance
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION apply_transaction_to_lot_balance();

CREATE FUNCTION reject_transaction_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'transactions are append-only; add a correcting transaction instead'
    USING ERRCODE = 'restrict_violation',
          DETAIL = format('%s on transaction %s was rejected', TG_OP, OLD.id);
END;
$$;

CREATE TRIGGER transactions_append_only
  BEFORE UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION reject_transaction_change();
