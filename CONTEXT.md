# Subscription Tracker — Domain Glossary

## Subscription
A recurring payment the user has agreed to. Has a name, price, billing cycle, payment method, category, and billing day.

## Billing Cycle
Either `monthly` or `annually`. Determines how often the subscription charges.

## Billing Day
The day of the month (1–31) on which the subscription renews. Used to calculate the next payment date automatically.

## Monthly Equivalent
An annual subscription's price divided by 12. Used to normalize spend across billing cycles for dashboard totals.

## Payment Method
How the subscription is charged. Free-text string (e.g., "Chase Sapphire", "Apple Pay"). Blank input defaults to `"Credit Card"`. Suggested values shown via datalist but not restricted.

## Category
A predefined classification for the subscription. One of: Entertainment, Productivity, Cloud / Storage, News & Media, Health & Fitness, Finance, Shopping, Gaming, Utilities, Other.

## Dashboard
The main view (`/`). Shows total monthly spend, spend-by-category and spend-by-payment-method donut charts (collapsible), and a filterable/sortable subscription list. Charts reflect active filters; total spend does not.

## Currency
A single user-configured currency symbol/code applied to all prices. No conversion math is performed.

## User
An authenticated account identified by email + password. Each user owns their own subscriptions.

## Session
Active authenticated state for a User. Absent = unauthenticated; present = app is usable.
