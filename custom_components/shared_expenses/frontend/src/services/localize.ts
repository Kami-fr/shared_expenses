/** Panel translations. English is the fallback. */

const EN = {
  app_title: "Shared Expenses",
  groups: "Groups",
  no_groups: "No group yet. Create one to get started.",
  new_group: "New group",
  create_group: "Create group",
  group_name: "Group name",
  description: "Description",
  currency: "Currency",
  archived: "Archived",
  archive: "Archive",
  restore: "Restore",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save",
  create: "Create",
  back: "Back",

  tab_balances: "Balances",
  tab_expenses: "Expenses",
  tab_members: "Members",

  balance_settled: "Everything is settled.",
  owes: "owes",
  to: "to",
  reimbursements: "Reimbursements",
  settle_up: "Settle up",

  expenses: "Expenses",
  no_expenses: "No expense yet.",
  new_expense: "New expense",
  expense_title: "Title",
  amount: "Amount",
  paid_by: "Paid by",
  date: "Date",
  category: "Category",
  no_category: "No category",
  split: "Split",
  split_equally: "Equally",
  split_custom: "Custom amounts",
  split_rule: "Use the default rule",
  split_rule_hint: "Applies the rule of the category, or of the group.",
  shares_mismatch: "The shares must add up to the amount.",
  participants: "Participants",

  members: "Members",
  no_members: "No member yet.",
  new_member: "Add member",
  member_name: "Name",
  remove_member: "Remove from group",
  role_owner: "Owner",
  role_admin: "Admin",
  role_member: "Member",

  payments: "Payments",
  new_payment: "Record a payment",
  from_member: "From",
  to_member: "To",

  loading: "Loading…",
  error_generic: "Something went wrong.",
  group_not_found: "This group no longer exists.",
  group_archived: "This group is archived.",
  member_not_found: "This member no longer exists.",
  member_already_in_group: "This member is already in the group.",
  category_not_found: "This category no longer exists.",
  expense_not_found: "This expense no longer exists.",
  invalid_expense: "This expense is invalid.",
  invalid_expense_shares: "The shares do not add up to the amount.",
  invalid_split_rule: "This split rule is invalid.",
  payment_not_found: "This payment no longer exists.",
  invalid_payment: "This payment is invalid.",
  not_loaded: "The integration is not loaded.",
  unknown_error: "Something went wrong.",
};

type Key = keyof typeof EN;

const FR: Record<Key, string> = {
  app_title: "Dépenses partagées",
  groups: "Groupes",
  no_groups: "Aucun groupe pour l'instant. Créez-en un pour commencer.",
  new_group: "Nouveau groupe",
  create_group: "Créer le groupe",
  group_name: "Nom du groupe",
  description: "Description",
  currency: "Devise",
  archived: "Archivé",
  archive: "Archiver",
  restore: "Restaurer",
  delete: "Supprimer",
  cancel: "Annuler",
  save: "Enregistrer",
  create: "Créer",
  back: "Retour",

  tab_balances: "Soldes",
  tab_expenses: "Dépenses",
  tab_members: "Membres",

  balance_settled: "Tout est réglé.",
  owes: "doit",
  to: "à",
  reimbursements: "Remboursements",
  settle_up: "Rembourser",

  expenses: "Dépenses",
  no_expenses: "Aucune dépense pour l'instant.",
  new_expense: "Nouvelle dépense",
  expense_title: "Intitulé",
  amount: "Montant",
  paid_by: "Payé par",
  date: "Date",
  category: "Catégorie",
  no_category: "Sans catégorie",
  split: "Répartition",
  split_equally: "Parts égales",
  split_custom: "Montants personnalisés",
  split_rule: "Utiliser la règle par défaut",
  split_rule_hint: "Applique la règle de la catégorie, sinon celle du groupe.",
  shares_mismatch: "Le total des parts doit égaler le montant.",
  participants: "Participants",

  members: "Membres",
  no_members: "Aucun membre pour l'instant.",
  new_member: "Ajouter un membre",
  member_name: "Nom",
  remove_member: "Retirer du groupe",
  role_owner: "Propriétaire",
  role_admin: "Administrateur",
  role_member: "Membre",

  payments: "Paiements",
  new_payment: "Enregistrer un paiement",
  from_member: "De",
  to_member: "Vers",

  loading: "Chargement…",
  error_generic: "Une erreur est survenue.",
  group_not_found: "Ce groupe n'existe plus.",
  group_archived: "Ce groupe est archivé.",
  member_not_found: "Ce membre n'existe plus.",
  member_already_in_group: "Ce membre fait déjà partie du groupe.",
  category_not_found: "Cette catégorie n'existe plus.",
  expense_not_found: "Cette dépense n'existe plus.",
  invalid_expense: "Cette dépense est invalide.",
  invalid_expense_shares: "Le total des parts ne correspond pas au montant.",
  invalid_split_rule: "Cette règle de répartition est invalide.",
  payment_not_found: "Ce paiement n'existe plus.",
  invalid_payment: "Ce paiement est invalide.",
  not_loaded: "L'intégration n'est pas chargée.",
  unknown_error: "Une erreur est survenue.",
};

const LANGUAGES: Record<string, Record<Key, string>> = { en: EN, fr: FR };

/** Return a translator for a Home Assistant language code. */
export function localizer(language: string): (key: Key) => string {
  const table = LANGUAGES[language.split("-")[0]] ?? EN;

  return (key: Key) => table[key] ?? EN[key] ?? key;
}

/** Turn a WebSocket error into a readable message. */
export function errorMessage(
  error: unknown,
  translate: (key: Key) => string,
): string {
  const code = (error as { code?: string })?.code;

  if (code && code in EN) {
    return translate(code as Key);
  }

  const message = (error as { message?: string })?.message;

  return message || translate("error_generic");
}

export type LocalizeKey = Key;
export type Localizer = (key: Key) => string;
