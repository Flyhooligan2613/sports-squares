-- Credit shop game items: squares, pick'em lines, survivor shields

alter table public.player_inventory drop constraint if exists player_inventory_item_type_check;
alter table public.player_inventory add constraint player_inventory_item_type_check
  check (item_type in (
    'square_credit', 'pickem_entry', 'reward_token', 'mystery_box',
    'coupon', 'tier_reward', 'merch_coupon', 'giveaway_ticket',
    'cosmetic', 'badge', 'referral_bonus', 'promo_credit', 'survivor_shield'
  ));

insert into public.ecosystem_rewards_catalog (slug, category, title, description, credit_cost, reward_type, reward_value, sort_order)
values
  (
    'bonus-square-entry',
    'game_items',
    'Bonus Square Entry',
    'One free square on any open board — use from your inventory when joining a pool.',
    150,
    'bonus_square',
    '{"quantity": 1}',
    5
  ),
  (
    'pickem-line-standard',
    'game_items',
    'Pick''em Line Credit',
    'Standard Pick''em entry line credit — stackable toward your weekly card.',
    200,
    'pickem_entry',
    '{"entryTierCents": 1000}',
    6
  ),
  (
    'pickem-line-premium',
    'game_items',
    'Premium Pick''em Line',
    'Premium Pick''em line credit for higher-stakes weekly contests.',
    450,
    'pickem_entry',
    '{"entryTierCents": 2500}',
    7
  ),
  (
    'survivor-shield-single',
    'game_items',
    'Survivor X Shield',
    'One survival shield — protects your pick if your team loses that week.',
    750,
    'survivor_shield',
    '{"quantity": 1}',
    8
  ),
  (
    'survivor-shield-pack',
    'game_items',
    'Survivor Shield Pack (3)',
    'Three survival shields for Survivor X private leagues.',
    2000,
    'survivor_shield',
    '{"quantity": 3}',
    9
  )
on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  description = excluded.description,
  credit_cost = excluded.credit_cost,
  reward_type = excluded.reward_type,
  reward_value = excluded.reward_value,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();
