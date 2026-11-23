# Armada Field Studio

John Miller’s J+1 field report from the RSI House hackathon in San Francisco. The site serves the current film directly from Cloudflare Workers Static Assets, so visitors can watch without signing in.

[Watch the latest cut](https://armada-field-studio.john-2ea.workers.dev/) · [Watch Cut 2 on YouTube](https://youtu.be/kgUpJfTMzUU) · [Sundai project](https://www.sundai.club/projects/2443bf5f-7b82-40e8-8922-8cf3e3eba7e3)

## Publish a revision

Replace `public/latest.mp4` with the new export. Update the YouTube link in `public/index.html` if a new YouTube version is available. Preview with `npx wrangler@4 dev`, then deploy with `npx wrangler@4 deploy` from this directory using the Worker owner's Cloudflare account. The Worker name and public player URL stay the same.
