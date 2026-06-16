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
How the subscription is charged. Either a free-text credit card label (e.g., "Chase Sapphire"), `Apple Pay`, or `Google Pay`.

## Category
A predefined classification for the subscription. One of: Entertainment, Productivity, Cloud / Storage, News & Media, Health & Fitness, Finance, Shopping, Gaming, Utilities, Other.

## Dashboard
The main view (`/`). Shows total monthly spend, spend by category, and a list of all subscriptions sorted by price high to low.

## Currency
A single user-configured currency symbol/code applied to all prices. No conversion math is performed.
